<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import { diffChars } from "diff";
import {
  QUESTION_DIRECTION_ITEMS,
  QUESTION_TYPE_ITEMS,
  scheduleCardReview,
} from "~/features/deck";
import {
  generateQuestions,
  getDefaultLearnQuestionState,
  getDefaultLearnSession,
  getDefaultLearnSetting,
  type LearnQuestion,
  type LearnQuestionState,
  type LearnSession,
  type LearnSetting,
  type SaveAnswersPayload,
  useStudyToasts,
} from "~/features/study";
import { evaluateWrittenAnswer } from "~/features/study/utils/scoring/evaluateWrittenAnswer";
import { ShortcutKey } from "~/shared/enums";
import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import { focusInput, getCards } from "~/shared/utils";

const NEXT_QUESTION_DELAY = 750;

const { token } = useAuth();
const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const toast = useStudyToasts();
const store = useDeckStore();

const userWrittenAnswerRef = useTemplateRef("userWrittenAnswerInput");
const isSettingModalOpen = refManualReset(false);
const snapshotSetting = refManualReset("");

const saveAnswerPayload = ref<SaveAnswersPayload>({
  answers: [],
});

const learnSession = reactive<LearnSession>(getDefaultLearnSession());
const questionState = reactive<LearnQuestionState>(
  getDefaultLearnQuestionState(),
);
const setting = reactive<LearnSetting>(getDefaultLearnSetting());

const progress = computed(() => {
  if (!learnSession.totalQuestions) return 0;
  return (learnSession.correctCount / learnSession.totalQuestions) * 100;
});

const shouldShowAnswerDiff = computed(
  () =>
    questionState.isDisplayingReviewScreen &&
    questionState.answerStatus !== undefined &&
    questionState.answerStatus !== "correct" &&
    learnSession.currentQuestion?.type === "written",
);

const {
  status,
  pending: isSavingAnswers,
  execute: saveAnswers,
} = useFetch<SuccessResponse, ErrorResponse>(
  `/api/study/save-answers/${store.deckId}`,
  {
    method: "POST",
    headers: { Authorization: token.value || "" },
    body: saveAnswerPayload,
    immediate: false,
    watch: false,
  },
);

watch(() => store.deck?.cards, initLearnSession);
watch(
  () => setting.types.length,
  () => {
    if (!setting.types.length) setting.types = ["multiple_choices"];
  },
);

watch(status, () => {
  if (status.value === "error") toast.saveAnswersFailed();
});

watchDeep(() => learnSession.cardsToSave, handleSaveAnswers);

async function handleSaveAnswers() {
  if (!learnSession.cardsToSave.length) return;
  saveAnswerPayload.value = { answers: learnSession.cardsToSave };
  await saveAnswers();
  learnSession.cardsToSave = [];
}

function initLearnSession() {
  if (!store.deck?.cards?.length) return;

  isSettingModalOpen.reset();
  resetQuestionState();

  Object.assign(learnSession, getDefaultLearnSession());
  learnSession.studyQueue = generateQuestions<LearnQuestion>({
    cards: getCards(store.deck.cards),
    types: setting.types,
    dir: setting.direction,
    answerPool: store.deck.cards,
  });
  learnSession.totalQuestions = learnSession.studyQueue.length;
  learnSession.currentQuestion = learnSession.studyQueue.shift();
}

function evaluateUserAnswer(userAnswer: number | string) {
  const question = learnSession.currentQuestion;
  if (!question || questionState.isDisplayingReviewScreen) return;

  if (question.type === "multiple_choices" && typeof userAnswer === "number") {
    questionState.userChoiceIndex = userAnswer;

    if (userAnswer === question.correctChoiceIndex) {
      questionState.answerStatus = "correct";
    } else {
      questionState.answerStatus = "incorrect";
    }

    questionState.answerDiffs = [];
  }

  if (question.type === "written" && typeof userAnswer === "string") {
    const inputRef = userWrittenAnswerRef.value?.inputRef;
    if (inputRef) inputRef.blur();

    const result = evaluateWrittenAnswer(userAnswer, question.correctAnswer);

    questionState.answerStatus = result.status;
    questionState.answerDiffs =
      result.status === "correct"
        ? []
        : diffChars(userAnswer, question.correctAnswer);
  }

  if (questionState.answerStatus === "correct") {
    learnSession.correctCount++;
  } else if (
    questionState.answerStatus === "almost" ||
    questionState.answerStatus === "typo"
  ) {
    learnSession.correctCount++;
  } else {
    learnSession.incorrectCount++;
  }

  questionState.isDisplayingReviewScreen = true;

  if (questionState.answerStatus !== "correct" && setting.showCorrectAnswer) {
    return;
  }

  setTimeout(() => nextQuestion(), NEXT_QUESTION_DELAY);
}

async function nextQuestion() {
  if (!learnSession.currentQuestion || !questionState.answerStatus) return;

  const updatedCard = scheduleCardReview(
    learnSession.currentQuestion,
    questionState.answerStatus,
    questionState.hintUsedCount,
  );

  if (questionState.answerStatus === "incorrect") {
    learnSession.retryQueue.push(updatedCard);
  }

  // trigger saveAnswers in watchDebounced
  const index = learnSession.cardsToSave.findIndex(
    (a) => a.id === updatedCard.id,
  );
  if (index !== -1) {
    learnSession.cardsToSave[index] = updatedCard;
  } else {
    learnSession.cardsToSave.push(updatedCard);
  }

  if (!learnSession.studyQueue.length) {
    if (!learnSession.retryQueue.length) {
      resetQuestionState();
      learnSession.currentQuestion = undefined;
    }

    learnSession.studyQueue = learnSession.retryQueue;
    learnSession.retryQueue = [];
  }

  resetQuestionState();
  learnSession.currentQuestion = learnSession.studyQueue.shift();
}

function resetQuestionState() {
  Object.assign(questionState, getDefaultLearnQuestionState());
  focusInput(userWrittenAnswerRef.value?.inputRef);
}

async function handleCloseSettingModal() {
  if (JSON.stringify(setting) === snapshotSetting.value) return;

  snapshotSetting.reset();
  await store.fetchDeck();
}

// TODO: calculate next review date based on hint used count
function onGetAHint() {
  if (learnSession.currentQuestion) {
    questionState.userAnswer =
      learnSession.currentQuestion.correctAnswer.substring(
        0,
        questionState.hintUsedCount + 1,
      );

    questionState.hintUsedCount++;
  }

  focusInput(userWrittenAnswerRef.value?.inputRef);
}

function handleChoiceShortcut(index: number) {
  if (
    questionState.answerStatus === "incorrect" &&
    questionState.isDisplayingReviewScreen &&
    learnSession.currentQuestion?.correctChoiceIndex === index
  ) {
    nextQuestion();
  } else {
    evaluateUserAnswer(index);
  }
}

function handleSkip() {
  if (!learnSession.currentQuestion) return;

  evaluateUserAnswer(
    learnSession.currentQuestion.type === "multiple_choices" ? -1 : "",
  );
}

function getChoiceBtnClass(choiceIndex: number) {
  if (!learnSession.currentQuestion) return "";

  const isThisChoiceSelected = questionState.userChoiceIndex === choiceIndex;
  const isThisChoiceCorrect =
    learnSession.currentQuestion.correctChoiceIndex === choiceIndex;

  const successClass =
    "border-success bg-success/10 text-success hover:text-success hover:border-success hover:bg-success/10 hover:scale-102";

  if (questionState.isDisplayingReviewScreen) {
    if (isThisChoiceSelected) {
      if (isThisChoiceCorrect) {
        return successClass;
      }

      return "border-error bg-error/10 text-error";
    }

    if (isThisChoiceCorrect && setting.showCorrectAnswer) {
      return `${successClass} border-dashed`;
    }

    return "opacity-70";
  }
}

function getWrittenInputClass() {
  if (!questionState.isDisplayingReviewScreen) return "";

  if (
    questionState.answerStatus === "typo" ||
    questionState.answerStatus === "almost"
  ) {
    return "border-warning";
  }

  if (questionState.answerStatus === "correct") {
    return "border-success";
  }

  return "border-error";
}

function getChoiceDisabledState(choiceIndex: number) {
  if (!questionState.isDisplayingReviewScreen) return false;

  const question = learnSession.currentQuestion;
  if (!question) return true;

  const isThisSelected = questionState.userChoiceIndex === choiceIndex;
  const isThisChoiceCorrect = question.correctChoiceIndex === choiceIndex;

  if (isThisSelected) {
    return true;
  }

  if (isThisChoiceCorrect) {
    return false;
  }

  return true;
}

defineShortcuts({
  [ShortcutKey.LEARN_NEXT_QUESTION]: () => nextQuestion(),
  [ShortcutKey.CHOICE_1]: () => handleChoiceShortcut(0),
  [ShortcutKey.CHOICE_2]: () => handleChoiceShortcut(1),
  [ShortcutKey.CHOICE_3]: () => handleChoiceShortcut(2),
  [ShortcutKey.CHOICE_4]: () => handleChoiceShortcut(3),
  [ShortcutKey.GET_A_HINT]: {
    handler: () => onGetAHint(),
    usingInput: true,
  },
  [ShortcutKey.SKIP]: {
    handler: () => handleSkip(),
    usingInput: true,
  },
});
</script>

<template>
  <UContainer v-if="learnSession.currentQuestion">
    <div class="flex place-content-between place-items-center gap-2">
      <UButton
        :to="`/library/${store.slug}/flashcards?deckId=${store.deckId}`"
        label="Flashcards"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        icon="i-lucide-move-left"
      />

      <UButton
        :to="`/library/${store.slug}/test?deckId=${store.deckId}`"
        label="Test"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        trailing-icon="i-lucide-move-right"
      />
    </div>

    <div class="mb-8 flex w-full flex-col gap-2">
      <h1
        class="mb-2 flex place-items-center place-self-center text-lg font-semibold sm:text-xl"
      >
        {{ store.deck?.name }}

        <UIcon
          v-if="!isSavingAnswers"
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

      <div class="flex place-content-between">
        <div class="flex place-items-center gap-2">
          <UBadge
            :label="learnSession.incorrectCount"
            class="rounded-full px-2"
            variant="subtle"
            color="error"
          />

          <span class="text-error text-sm">Incorrect</span>
        </div>

        <div>
          {{ `${learnSession.correctCount} / ${learnSession.totalQuestions}` }}
        </div>

        <div class="flex place-items-center gap-2">
          <span class="text-success text-sm">Correct</span>

          <UBadge
            :label="learnSession.correctCount"
            class="rounded-full px-2"
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
          'bg-inherit p-0 ring-0 rounded-none': !smAndLarger,
        }"
      >
        <template #header>
          <UProgress
            v-model="progress"
            :ui="{ base: 'bg-inherit' }"
            size="sm"
          />
        </template>

        <template #default>
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-medium">
              <UButton
                class="hover:text-primary ml-0 cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
              />

              {{
                learnSession.currentQuestion.direction === "term_to_def"
                  ? `Term (${learnSession.currentQuestion.termLanguage})`
                  : `Definition (${learnSession.currentQuestion.definitionLanguage})`
              }}
            </span>

            <UButton
              v-if="learnSession.currentQuestion.type === 'written'"
              :variant="smAndLarger ? 'soft' : 'ghost'"
              class="mr-0 cursor-pointer"
              icon="i-lucide-lightbulb"
              color="neutral"
              @click="onGetAHint"
            >
              Get a hint
            </UButton>
          </div>

          <div class="text-xl font-medium sm:text-2xl">
            {{ learnSession.currentQuestion.question }}
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <span class="font-medium">
              {{
                learnSession.currentQuestion.type === "multiple_choices"
                  ? "Choose an answer"
                  : "Type your answer"
              }}
            </span>

            <!-- Multiple Choices Answer -->
            <div
              v-if="learnSession.currentQuestion.type === 'multiple_choices'"
              class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
            >
              <button
                v-for="(choice, choiceIndex) in learnSession.currentQuestion
                  .choices"
                :key="choiceIndex"
                :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none ${getChoiceBtnClass(choiceIndex)}`"
                :disabled="getChoiceDisabledState(choiceIndex)"
                @click="handleChoiceShortcut(choiceIndex)"
              >
                <UBadge
                  class="hidden h-8 w-8 shrink-0 place-content-center place-items-center rounded-full border border-inherit font-bold text-inherit ring-0 transition-all sm:flex"
                  variant="outline"
                >
                  {{ choiceIndex + 1 }}
                </UBadge>

                <span class="text-start text-base font-medium sm:text-lg">
                  {{ choice }}
                </span>
              </button>
            </div>

            <!-- Written Answer -->
            <div v-else class="flex w-full flex-col gap-2">
              <UInput
                ref="userWrittenAnswerInput"
                v-model="questionState.userAnswer"
                :ui="{
                  base: `text-lg sm:text-xl transition-all border-2 border-default ring-0 ${getWrittenInputClass()}`,
                }"
                :disabled="questionState.isDisplayingReviewScreen"
                variant="outline"
                color="neutral"
                autofocus
                @keydown.enter="evaluateUserAnswer(questionState.userAnswer)"
              />

              <Transition>
                <StudyAnswerDiff
                  v-if="shouldShowAnswerDiff"
                  :diffs="questionState.answerDiffs"
                />
              </Transition>
            </div>

            <div class="flex place-content-end place-items-center gap-2">
              <UButton
                :disabled="questionState.isDisplayingReviewScreen"
                class="cursor-pointer place-self-end font-medium"
                variant="ghost"
                color="error"
                tabindex="-1"
                @click="handleSkip"
              >
                Skip?
              </UButton>

              <UButton
                v-if="learnSession.currentQuestion.type === 'written'"
                :disabled="!questionState.userAnswer"
                class="cursor-pointer font-medium"
                size="lg"
                @click="evaluateUserAnswer(questionState.userAnswer)"
              >
                Answer
              </UButton>
            </div>
          </div>
        </template>
      </UCard>

      <USeparator v-if="!smAndLarger" />

      <div class="grid grid-cols-3 gap-2">
        <div />

        <div
          v-if="
            questionState.isDisplayingReviewScreen &&
            questionState.answerStatus !== 'correct' &&
            setting.showCorrectAnswer &&
            smAndLarger
          "
          class="place-self-center font-semibold"
        >
          Press
          <UKbd size="lg">Space</UKbd>

          or
          <UKbd
            v-if="learnSession.currentQuestion.correctChoiceIndex > -1"
            size="lg"
          >
            {{ learnSession.currentQuestion.correctChoiceIndex + 1 }}
          </UKbd>
          to continue.
        </div>

        <div v-else />

        <div class="flex place-items-center place-self-end">
          <UTooltip :delay-duration="200" text="Restart deck progress">
            <UButton
              class="cursor-pointer"
              icon="i-lucide-refresh-cw"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="store.handleRestartDeck"
            />
          </UTooltip>

          <UButton
            class="cursor-pointer place-self-end"
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            size="lg"
            @click="isSettingModalOpen = true"
          />
        </div>
      </div>
    </div>

    <UModal
      v-model:open="isSettingModalOpen"
      :fullscreen="!smAndLarger"
      :ui="{
        content: 'divide-none',
        body: 'flex-initial pt-0 sm:pt-0',
        footer: 'place-content-end',
      }"
      description="Let's customize your learning session"
      @after:enter="snapshotSetting = JSON.stringify(setting)"
      @after:leave="handleCloseSettingModal"
    >
      <template #title>
        <h2 class="text-xl font-semibold sm:text-2xl">Learn settings</h2>
      </template>

      <template #body>
        <div class="flex flex-col gap-2 font-medium">
          <div class="flex place-content-between place-items-center gap-2">
            <div>Show correct answer</div>

            <USwitch v-model="setting.showCorrectAnswer" size="lg" />
          </div>

          <USeparator label="Question format" />

          <div class="flex place-content-between place-items-center gap-2">
            <div>Question types</div>

            <USelect
              v-model="setting.types"
              :items="QUESTION_TYPE_ITEMS"
              :ui="{ content: 'min-w-fit' }"
              size="lg"
              value-key="value"
              multiple
            />
          </div>

          <div class="flex place-content-between place-items-center gap-2">
            <div>Answer with</div>

            <USelect
              v-model="setting.direction"
              :items="QUESTION_DIRECTION_ITEMS"
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
          @click="isSettingModalOpen = false"
        />
      </template>
    </UModal>
  </UContainer>

  <AppEmpty v-else-if="!store.isFetchingDeck" />
</template>
