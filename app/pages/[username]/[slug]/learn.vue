<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core';
import type { LearnSetting, LearnState } from '~~/shared/types/card';

const { token } = useAuth();
const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

const isCorrect = ref<boolean | undefined>(undefined);
const isInReview = ref(false);
const isAnswerSaving = ref(false);
const isIgnoreDate = ref(false);
const isSettingOpen = ref(false);
const correctCount = ref(0);
const incorrectCount = ref(0);
const userAnswer = ref('');
const userChoiceIndex = ref<number>(-1);
const question = ref<LearnQuestion | undefined>(undefined);

const inputComponent = useTemplateRef('input');

const learn = reactive<LearnState>({
  totalQuestions: 0,
  queue: [],
  retryQueue: [],
  answers: [],
});

const setting = reactive<LearnSetting>({
  showCorrectAnswer: true,
  types: ['multiple_choices'],
  direction: 'term_to_def',
});
let snapshotSetting = '';

const isIncorrect = computed(() => isCorrect.value === false);

const progress = computed(() => {
  if (!learn.totalQuestions) return 0;
  return (correctCount.value / learn.totalQuestions) * 100;
});

const deckId = computed(() => route.query.deckId as string);

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const username = computed(() => {
  const n = route.params.username;

  return Array.isArray(n) ? n[0] : n;
});

const userInputClass = computed(() => {
  let className = '';

  if (isInReview.value) className += ' ring-2';
  if (isCorrect.value) className += ' ring-success';
  if (isIncorrect.value) className += ' ring-error';

  return className;
});

const {
  data: deck,
  pending,
  refresh,
} = await useLazyFetch<DeckWithCards>(`/api/decks/${deckId.value}`, {
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(deck, (newDeck) => {
  if (newDeck && newDeck.cards.length > 0) {
    isAnswerSaving.value = false;
    isIgnoreDate.value = false;
    isSettingOpen.value = false;
    correctCount.value = 0;
    incorrectCount.value = 0;
    learn.answers = [];
    learn.retryQueue = [];

    resetQuestionState();

    learn.queue = generateQuestions<LearnQuestion>({
      cards: getCards(newDeck.cards, isIgnoreDate.value),
      types: setting.types,
      dir: setting.direction,
      answerPool: newDeck.cards.map((c) => ({
        id: c.id,
        term: c.term,
        definition: c.definition,
      })),
    });
    learn.totalQuestions = learn.queue.length;
    question.value = learn.queue.shift();
  }
});

watch(
  () => setting.types,
  (newTypes) => {
    if (!newTypes.length) setting.types = ['multiple_choices'];
  },
);

watchDebounced(learn, saveAnswers, {
  debounce: 1000,
  deep: true,
});

function submitAnswer(userAnswer: number | string) {
  const q = question.value;
  if (!q || isInReview.value) return;

  if (q.type === 'multiple_choices' && typeof userAnswer === 'number') {
    userChoiceIndex.value = userAnswer;
    isCorrect.value = userAnswer === q.correctChoiceIndex;
  } else if (q.type === 'written' && typeof userAnswer === 'string') {
    const inputRef = inputComponent.value?.inputRef;
    if (inputRef) inputRef.blur();

    isCorrect.value =
      userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
  } else {
    return;
  }

  isInReview.value = true;

  if (isCorrect.value) {
    setTimeout(() => {
      throttledHandleAnswer(true, q);
    }, 500);
  } else {
    if (setting.showCorrectAnswer) return;

    throttledHandleAnswer(false, q);
  }
}

const throttledSubmitAnswer = useThrottleFn(submitAnswer, 500);

function handleAnswer(correct?: boolean, q?: LearnQuestion) {
  if (!q || correct === undefined) return;

  isAnswerSaving.value = true;

  const updated = Object.assign({}, q, calcCardState({ ...q, correct }));

  if (correct) {
    correctCount.value++;
  } else {
    incorrectCount.value++;
    learn.retryQueue.push(updated);
  }

  // trigger saveAnswers in watchDebounced
  const index = learn.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learn.answers[index] = updated;
  } else {
    learn.answers.push(updated);
  }

  if (!learn.queue.length) {
    if (!learn.retryQueue.length) {
      resetQuestionState();
      question.value = undefined;
    }

    learn.queue = learn.retryQueue;
    learn.retryQueue = [];
  }

  resetQuestionState();
  question.value = learn.queue.shift();
}

const throttledHandleAnswer = useThrottleFn(handleAnswer, 500);

function resetQuestionState() {
  isCorrect.value = undefined;
  isInReview.value = false;
  userAnswer.value = '';
  userChoiceIndex.value = -1;

  const inputRef = inputComponent.value?.inputRef;
  if (inputRef) inputRef.focus();
}

async function saveAnswers() {
  const answersToSave = [...learn.answers];
  if (answersToSave.length === 0) return;

  $fetch(`/api/study/save-answer/${deckId.value}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
    body: { answers: answersToSave },
  })
    .then(() => (learn.answers = []))
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    })
    .finally(() => (isAnswerSaving.value = false));
}

async function onRestart() {
  $fetch(`/api/decks/restart/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  }).then(async () => {
    isIgnoreDate.value = false;
    await refresh();
  });
}

async function onIgnoreDate() {
  isIgnoreDate.value = true;
  await refresh();
}

async function onSettingClosed() {
  if (JSON.stringify(setting) === snapshotSetting) return;

  snapshotSetting = '';
  await refresh();
}

function handleChoiceShortcut(index: number) {
  if (
    isIncorrect.value &&
    isInReview.value &&
    question.value?.correctChoiceIndex === index
  ) {
    throttledHandleAnswer(isCorrect.value, question.value);
  } else {
    throttledSubmitAnswer(index);
  }
}

function getChoiceBtnClass(cIndex: number) {
  if (!question.value) return '';

  const isThisSelected = userChoiceIndex.value === cIndex;
  const isThisChoiceCorrect = question.value.correctChoiceIndex === cIndex;

  const successClass =
    'border-success bg-success/10 text-success hover:text-success hover:border-success hover:bg-success/10 hover:scale-102';

  if (isInReview.value) {
    if (isThisSelected) {
      if (isThisChoiceCorrect) {
        return successClass;
      }

      return 'border-error bg-error/10 text-error';
    }

    if (isThisChoiceCorrect) {
      return successClass + ' border-dashed';
    }

    return 'opacity-60';
  }
}

function getChoiceDisabledState(cIndex: number) {
  if (!isInReview.value) return false;

  const q = question.value;
  if (!q) return true;

  const isThisSelected = userChoiceIndex.value === cIndex;
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
  ' ': () => throttledHandleAnswer(isCorrect.value, question.value),
  '1': () => handleChoiceShortcut(0),
  '2': () => handleChoiceShortcut(1),
  '3': () => handleChoiceShortcut(2),
  '4': () => handleChoiceShortcut(3),
});
</script>

<template>
  <ClientOnly>
    <UContainer>
      <div class="flex place-content-between place-items-center gap-2">
        <UButton
          :to="`/${username}/${deckSlug}/flashcards?deckId=${deckId}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          icon="i-lucide-move-left"
          label="Back to Flashcards"
        />

        <UButton
          :to="`/${username}/${deckSlug}/test?deckId=${deckId}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          trailing-icon="i-lucide-move-right"
          label="Go to Test"
        />
      </div>

      <div v-if="pending" class="flex justify-center p-10">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
      </div>

      <div v-else-if="question" class="mb-8 flex w-full flex-col gap-2">
        <h1
          class="mb-2 flex place-items-center place-self-center text-lg font-semibold sm:text-xl"
        >
          {{ deck?.name || '' }}

          <UIcon
            v-if="!isAnswerSaving"
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
              :label="incorrectCount"
              class="h-6 w-6 shrink-0 place-content-center rounded-full px-2"
              variant="subtle"
              color="error"
            />

            <span class="text-error sm:text-md text-sm">Incorrect</span>
          </div>

          <div>{{ `${correctCount} / ${learn.totalQuestions}` }}</div>

          <div class="flex place-items-center gap-2">
            <span class="text-success sm:text-md text-sm">Correct</span>

            <UBadge
              :label="correctCount"
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
            <span class="flex place-items-center gap-1 font-semibold">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
              />
              Term
            </span>

            <UButton
              class="cursor-pointer"
              icon="i-lucide-lightbulb"
              :variant="smAndLarger ? 'soft' : 'ghost'"
              color="neutral"
            >
              Get a hint
            </UButton>
          </div>

          <div class="text-xl font-medium sm:text-2xl">
            {{ question.question }}
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <span class="font-bold">
              {{
                question.type === 'multiple_choices'
                  ? 'Choose an answer'
                  : 'Type your answer'
              }}
            </span>

            <!-- Multiple Choices Answer -->
            <div
              v-if="question.type === 'multiple_choices'"
              class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
            >
              <button
                v-for="(choice, cIndex) in question.choices"
                :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none ${getChoiceBtnClass(cIndex)}`"
                :key="cIndex"
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
                v-model="userAnswer"
                :ui="{
                  base: `text-lg sm:text-xl transition-all ${userInputClass}`,
                }"
                ref="input"
                variant="outline"
                color="neutral"
                autofocus
                @keydown.enter="throttledSubmitAnswer(userAnswer)"
              />

              <UInput
                v-if="isCorrect === false"
                :ui="{
                  base: `text-lg sm:text-xl transition-all ring-2 ring-success disabled:opacity-100 disabled:cursor-not-allowed`,
                }"
                :default-value="question.answer"
                disabled
              />
            </div>

            <div class="flex place-content-end place-items-center gap-2">
              <UButton
                class="cursor-pointer place-self-end font-medium"
                variant="ghost"
                tabindex="-1"
              >
                Don't know?
              </UButton>

              <UButton
                v-if="question.type === 'written'"
                :disabled="!userAnswer"
                class="cursor-pointer font-medium"
                @click="throttledSubmitAnswer(userAnswer)"
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

        <div class="grid grid-cols-3 gap-2">
          <div></div>

          <div
            v-if="isInReview && setting.showCorrectAnswer && isIncorrect"
            class="place-self-center font-semibold"
          >
            Press <Kbd label="Space" />
            <span v-if="question.correctChoiceIndex">
              or
              <Kbd :label="question.correctChoiceIndex + 1" />
            </span>
            to continue
          </div>

          <div v-else></div>

          <div class="flex place-items-center place-self-end">
            <KeyboardShortcuts />

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
                <h2 class="text-xl font-semibold sm:text-2xl">
                  Learn settings
                </h2>
              </template>

              <template #body>
                <div class="flex flex-col gap-2 font-semibold">
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
            to: '/home',
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
            onClick: onRestart,
          },
          {
            icon: 'i-lucide-fast-forward',
            label: 'Ignore & continue',
            color: 'neutral',
            variant: 'subtle',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: onIgnoreDate,
          },
        ]"
        variant="naked"
        icon="i-lucide-party-popper"
        title="You're all caught up — nothing to review now."
        description="Optimize your retention by strictly adhering to the next review date."
        size="xl"
      />
    </UContainer>
  </ClientOnly>
</template>
