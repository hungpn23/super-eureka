<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core';

const { token } = useAuth();
const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');
const store = useDeckStore();

const throttledSubmitAnswer = useThrottleFn(submitAnswer, 500);
const throttledNextAnswer = useThrottleFn(nextAnswer, 500);

const inputElement = useTemplateRef('input');

const isSettingOpen = ref(false);

const session = reactive<LearnSession>({
  currentQuestion: undefined,
  cardsToSave: [],
  studyQueue: [],
  retryQueue: [],
  totalQuestions: 0,
  correctCount: 0,
  incorrectCount: 0,
  isSavingAnswers: false,
});

const state = reactive<LearnQuestionState>({
  userAnswer: '',
  userChoiceIndex: -1,
  isInReview: false,
  isCorrect: undefined,
  hintUsedCount: 0,
});

const setting = reactive<LearnSetting>({
  showCorrectAnswer: true,
  types: ['written', 'multiple_choices'],
  direction: 'term_to_def',
});
let snapshotSetting = '';

const isIncorrect = computed(() => state.isCorrect === false);

const progress = computed(() => {
  if (!session.totalQuestions) return 0;
  return (session.correctCount / session.totalQuestions) * 100;
});

watch(
  () => store.deck?.cards,
  (newCards) => {
    if (newCards && newCards.length > 0) {
      isSettingOpen.value = false;
      resetQuestionState();

      session.isSavingAnswers = false;
      session.correctCount = 0;
      session.incorrectCount = 0;
      session.cardsToSave = [];
      session.retryQueue = [];

      session.studyQueue = generateQuestions<LearnQuestion>({
        cards: getCards(newCards, store.isIgnoreDate),
        types: setting.types,
        dir: setting.direction,
        answerPool: newCards,
      });
      session.totalQuestions = session.studyQueue.length;
      session.currentQuestion = session.studyQueue.shift();
    }
  },
);

watchDeep(
  () => setting.types,
  (newTypes) => {
    if (!newTypes.length) setting.types = ['multiple_choices'];
  },
);

watchDebounced(() => session.cardsToSave, saveAnswers, {
  debounce: 1000,
  deep: true,
});

function submitAnswer(userAnswer: number | string) {
  const q = session.currentQuestion;
  if (!q || state.isInReview) return;

  if (q.type === 'multiple_choices' && typeof userAnswer === 'number') {
    state.userChoiceIndex = userAnswer;
    state.isCorrect = userAnswer === q.correctChoiceIndex;
  } else if (q.type === 'written' && typeof userAnswer === 'string') {
    const inputRef = inputElement.value?.inputRef;
    if (inputRef) inputRef.blur();

    state.isCorrect =
      userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  } else {
    return;
  }

  state.isInReview = true;

  if (state.isCorrect) {
    session.correctCount++;

    setTimeout(() => {
      throttledNextAnswer(true, q);
    }, 500);
  } else {
    session.incorrectCount++;

    if (setting.showCorrectAnswer) return;

    throttledNextAnswer(false, q);
  }
}

function nextAnswer(isCorrect?: boolean, q?: LearnQuestion) {
  if (!q || isCorrect === undefined) return;

  session.isSavingAnswers = true;

  const updated = updateCard(q, isCorrect);

  if (isIncorrect.value) session.retryQueue.push(updated);

  // trigger saveAnswers in watchDebounced
  const index = session.cardsToSave.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    session.cardsToSave[index] = updated;
  } else {
    session.cardsToSave.push(updated);
  }

  if (!session.studyQueue.length) {
    if (!session.retryQueue.length) {
      resetQuestionState();
      session.currentQuestion = undefined;
    }

    session.studyQueue = session.retryQueue;
    session.retryQueue = [];
  }

  resetQuestionState();
  session.currentQuestion = session.studyQueue.shift();
}

function resetQuestionState() {
  state.isCorrect = undefined;
  state.isInReview = false;
  state.userAnswer = '';
  state.userChoiceIndex = -1;

  const inputRef = inputElement.value?.inputRef;
  if (inputRef) {
    setTimeout(() => {
      inputRef.focus();
    }, 300);
  }
}

async function saveAnswers() {
  const answersToSave = [...session.cardsToSave];
  if (answersToSave.length === 0) return;

  $fetch(`/api/study/save-answer/${store.deckId}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
    body: { answers: answersToSave },
  })
    .then(() => (session.cardsToSave = []))
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    })
    .finally(() => (session.isSavingAnswers = false));
}

async function onSettingClosed() {
  if (JSON.stringify(setting) === snapshotSetting) return;

  snapshotSetting = '';
  await store.refetch();
}

// TODO: calculate next review date based on hint used count
function onGetAHint() {
  if (session.currentQuestion) {
    state.userAnswer = session.currentQuestion.correctAnswer.substring(
      0,
      state.hintUsedCount + 1,
    );

    state.hintUsedCount++;
  }

  inputElement.value?.inputRef?.focus();
}

function handleChoiceShortcut(index: number) {
  if (
    isIncorrect.value &&
    state.isInReview &&
    session.currentQuestion?.correctChoiceIndex === index
  ) {
    throttledNextAnswer(state.isCorrect, session.currentQuestion);
  } else {
    throttledSubmitAnswer(index);
  }
}

function getChoiceBtnClass(cIndex: number) {
  if (!session.currentQuestion) return '';

  const isThisSelected = state.userChoiceIndex === cIndex;
  const isThisChoiceCorrect =
    session.currentQuestion.correctChoiceIndex === cIndex;

  const successClass =
    'border-success bg-success/10 text-success hover:text-success hover:border-success hover:bg-success/10 hover:scale-102';

  if (state.isInReview) {
    if (isThisSelected) {
      if (isThisChoiceCorrect) {
        return successClass;
      }

      return 'border-error bg-error/10 text-error';
    }

    if (isThisChoiceCorrect) {
      return successClass + ' border-dashed';
    }

    return 'opacity-70';
  }
}

function getWrittenInputClass() {
  if (!state.isInReview) return '';

  if (state.isCorrect) {
    return 'border-success';
  }

  return 'border-error';
}

function getChoiceDisabledState(cIndex: number) {
  if (!state.isInReview) return false;

  const q = session.currentQuestion;
  if (!q) return true;

  const isThisSelected = state.userChoiceIndex === cIndex;
  const isThisChoiceCorrect = q.correctChoiceIndex === cIndex;

  if (isThisSelected) {
    return true;
  }

  if (isThisChoiceCorrect) {
    return false;
  }

  return true;
}

defineShortcuts({
  ' ': () => throttledNextAnswer(state.isCorrect, session.currentQuestion),
  '1': () => handleChoiceShortcut(0),
  '2': () => handleChoiceShortcut(1),
  '3': () => handleChoiceShortcut(2),
  '4': () => handleChoiceShortcut(3),
});
</script>

<template>
  <SkeletonLearnPage
    v-if="store.status === 'idle' || store.status === 'pending'"
  />

  <UContainer v-else>
    <div class="flex place-content-between place-items-center gap-2">
      <UButton
        :to="`/library/${store.slug}/flashcards?deckId=${store.deckId}`"
        :label="smAndLarger ? 'Back to Flashcards' : 'Flashcards'"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        icon="i-lucide-move-left"
      />

      <UButton
        :to="`/library/${store.slug}/test?deckId=${store.deckId}`"
        :label="smAndLarger ? 'Go to Test' : 'Test'"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        trailing-icon="i-lucide-move-right"
      />
    </div>

    <div v-if="session.currentQuestion" class="mb-8 flex w-full flex-col gap-2">
      <h1
        class="mb-2 flex place-items-center place-self-center text-lg font-semibold sm:text-xl"
      >
        {{ store.deck?.name }}

        <UIcon
          v-if="!session.isSavingAnswers"
          name="i-lucide-check"
          class="text-success ml-2 size-5"
        />

        <span
          v-else
          class="text-muted ml-2 place-self-end text-base font-light"
        >
          Saving...
        </span>
      </h1>

      <div class="flex place-content-between place-items-center">
        <div class="flex place-items-center gap-2">
          <UBadge
            :label="session.incorrectCount"
            class="h-6 w-6 shrink-0 place-content-center rounded-full px-2"
            variant="subtle"
            color="error"
          />

          <span class="text-error sm:text-md text-sm">Incorrect</span>
        </div>

        <div>{{ `${session.correctCount} / ${session.totalQuestions}` }}</div>

        <div class="flex place-items-center gap-2">
          <span class="text-success sm:text-md text-sm">Correct</span>

          <UBadge
            :label="session.correctCount"
            class="h-6 w-6 shrink-0 place-content-center rounded-full px-2"
            variant="subtle"
            color="success"
          />
        </div>
      </div>

      <UCard
        :ui="{
          header: 'p-0 sm:px-0',
          body: `flex-1 w-full flex flex-col gap-4 sm:gap-4 place-content-between p-2`,
        }"
        class="bg-elevated flex min-h-[50dvh] flex-col divide-none transition-all sm:shadow-md"
        :class="{
          'bg-inherit p-0 ring-0': !smAndLarger,
        }"
      >
        <div class="flex w-full place-content-between place-items-center">
          <span class="flex place-items-center gap-1 font-medium">
            <UButton
              class="hover:text-primary ml-0 cursor-pointer rounded-full bg-inherit p-2"
              icon="i-lucide-volume-2"
              variant="soft"
              color="neutral"
            />
            {{
              session.currentQuestion.direction === 'term_to_def'
                ? 'Term'
                : 'Definition'
            }}
          </span>

          <UButton
            v-if="session.currentQuestion.type === 'written'"
            class="mr-0 cursor-pointer"
            icon="i-lucide-lightbulb"
            :variant="smAndLarger ? 'soft' : 'ghost'"
            color="neutral"
            @click="onGetAHint"
          >
            Get a hint
          </UButton>
        </div>

        <div class="text-xl font-medium sm:text-2xl">
          {{ session.currentQuestion.question }}
        </div>

        <div class="mt-2 flex w-full flex-col gap-2">
          <span class="font-medium">
            {{
              session.currentQuestion.type === 'multiple_choices'
                ? 'Choose an answer'
                : 'Type your answer'
            }}
          </span>

          <!-- Multiple Choices Answer -->
          <div
            v-if="session.currentQuestion.type === 'multiple_choices'"
            class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
          >
            <button
              v-for="(choice, cIndex) in session.currentQuestion.choices"
              :key="cIndex"
              :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none ${getChoiceBtnClass(cIndex)}`"
              :disabled="getChoiceDisabledState(cIndex)"
              @click="handleChoiceShortcut(cIndex)"
            >
              <UBadge
                class="hidden h-8 w-8 shrink-0 place-content-center place-items-center rounded-full border border-inherit font-bold text-inherit ring-0 transition-all sm:flex"
                variant="outline"
              >
                {{ cIndex + 1 }}
              </UBadge>

              <span class="text-start text-base font-medium sm:text-lg">
                {{ choice }}
              </span>
            </button>
          </div>

          <!-- Written Answer -->
          <div v-else class="flex w-full flex-col gap-2">
            <UInput
              ref="input"
              v-model="state.userAnswer"
              :ui="{
                base: `text-lg sm:text-xl transition-all border-2 border-default ring-0 ${getWrittenInputClass()}`,
              }"
              :disabled="state.isInReview"
              variant="outline"
              color="neutral"
              autofocus
              @keydown.enter="throttledSubmitAnswer(state.userAnswer)"
            />

            <Transition>
              <UInput
                v-if="isIncorrect && setting.showCorrectAnswer"
                :ui="{
                  base: `text-lg sm:text-xl transition-all border-2 border-dashed border-success ring-0`,
                }"
                :default-value="session.currentQuestion.correctAnswer"
                disabled
              />
            </Transition>
          </div>

          <div class="flex place-content-end place-items-center gap-2">
            <UButton
              class="cursor-pointer place-self-end font-medium"
              variant="ghost"
              color="error"
              tabindex="-1"
            >
              Skip?
            </UButton>

            <UButton
              v-if="session.currentQuestion.type === 'written'"
              :disabled="!state.userAnswer"
              class="cursor-pointer font-medium"
              size="lg"
              @click="throttledSubmitAnswer(state.userAnswer)"
            >
              Answer
            </UButton>
          </div>
        </div>

        <template #header>
          <UProgress
            v-model="progress"
            :ui="{ base: 'bg-inherit' }"
            size="sm"
          />
        </template>
      </UCard>

      <USeparator v-if="!smAndLarger" />

      <div class="grid grid-cols-3 gap-2">
        <div />

        <div
          v-if="
            state.isInReview &&
            setting.showCorrectAnswer &&
            isIncorrect &&
            smAndLarger
          "
          class="place-self-center font-semibold"
        >
          Press
          <AppKbd label="Space" />
          <span v-if="session.currentQuestion.correctChoiceIndex">
            or
            <AppKbd :label="session.currentQuestion.correctChoiceIndex + 1" />
          </span>
          to continue
        </div>

        <div v-else />

        <div class="flex place-items-center place-self-end">
          <!-- Options -->
          <UTooltip :delay-duration="200" text="Ignore review dates">
            <UButton
              :icon="`i-lucide-calendar${store.isIgnoreDate ? '-off' : ''}`"
              class="cursor-pointer"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="store.toggleIgnoreDate"
            />
          </UTooltip>

          <UTooltip :delay-duration="200" text="Restart deck progress">
            <UButton
              class="cursor-pointer"
              icon="i-lucide-refresh-cw"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="store.restartDeck"
            />
          </UTooltip>

          <!-- Learn Settings -->
          <UModal
            v-model:open="isSettingOpen"
            :fullscreen="!smAndLarger"
            :ui="{
              content: 'divide-none',
              body: 'flex-initial pt-0 sm:pt-0',
              footer: 'place-content-end',
            }"
            description="Let's customize your learning session"
            @after:enter="snapshotSetting = JSON.stringify(setting)"
            @after:leave="onSettingClosed"
          >
            <UButton
              class="cursor-pointer place-self-end"
              icon="i-lucide-settings"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="isSettingOpen = true"
            />

            <template #title>
              <h2 class="text-xl font-semibold sm:text-2xl">Learn settings</h2>
            </template>

            <template #body>
              <div class="flex flex-col gap-2 font-medium">
                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Show correct answer</div>

                  <USwitch v-model="setting.showCorrectAnswer" size="lg" />
                </div>

                <USeparator label="Question format" />

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Question types</div>

                  <USelect
                    v-model="setting.types"
                    :items="questionTypeItems"
                    :ui="{ content: 'min-w-fit' }"
                    size="lg"
                    value-key="value"
                    multiple
                  />
                </div>

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Answer with</div>

                  <USelect
                    v-model="setting.direction"
                    :items="questionDirectionItems"
                    :ui="{ content: 'min-w-fit' }"
                    size="lg"
                  />
                </div>
              </div>
            </template>

            <template #footer>
              <UButton
                class="cursor-pointer"
                label="Apply changes"
                color="neutral"
                size="lg"
                @click="isSettingOpen = false"
              />
            </template>
          </UModal>
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      :actions="[
        {
          to: '/library',
          icon: 'i-lucide-house',
          label: 'Home',
          color: 'success',
          variant: 'subtle',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
        },
        {
          icon: 'i-lucide-refresh-cw',
          label: 'Restart',
          color: 'error',
          variant: 'outline',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
          onClick: store.restartDeck,
        },
        {
          icon: 'i-lucide-fast-forward',
          label: 'Ignore & continue',
          color: 'neutral',
          variant: 'subtle',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
          onClick: () => store.updateIgnoreDate(true),
        },
      ]"
      variant="naked"
      icon="i-lucide-party-popper"
      title="You're all caught up — nothing to review now."
      description="Optimize your retention by strictly adhering to the next review date."
      size="xl"
    />
  </UContainer>
</template>
