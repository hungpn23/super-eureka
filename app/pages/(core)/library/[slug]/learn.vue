<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import { pick } from "lodash";
import {
	QUESTION_DIRECTION_ITEMS,
	QUESTION_TYPE_ITEMS,
	updateCard,
} from "~/features/deck";
import {
	api,
	evaluateAnswer,
	generateQuestions,
	getDefaultLearnQuestionState,
	getDefaultLearnSession,
	getDefaultLearnSetting,
	type LearnQuestion,
	type LearnQuestionState,
	type LearnSession,
	type LearnSetting,
	useStudyToasts,
} from "~/features/study";
import { ShortcutKey } from "~/shared/enums";
import { focusInput, getCards } from "~/shared/utils";

const { token } = useAuth();
const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const toast = useStudyToasts();
const store = useDeckStore();

const userWrittenAnswerRef = useTemplateRef("userWrittenAnswerInput");
const isSettingModalOpen = refManualReset(false);
const snapshotSetting = refManualReset("");

const session = reactive<LearnSession>(getDefaultLearnSession());
const questionState = reactive<LearnQuestionState>(
	getDefaultLearnQuestionState(),
);
const setting = reactive<LearnSetting>(getDefaultLearnSetting());

const isIncorrect = computed(() => questionState.isCorrect === false);
const progress = computed(() => {
	if (!session.totalQuestions) return 0;
	return (session.correctCount / session.totalQuestions) * 100;
});

const {
	status,
	pending: isSavingAnswers,
	execute: saveAnswers,
} = api.saveAnswers({
	deckId: store.deckId,
	token,
	cardsToSave: session.cardsToSave,
});

watch(
	() => store.deck?.cards,
	(newCards) => {
		if (newCards && newCards.length > 0) {
			isSettingModalOpen.reset();
			resetQuestionState();

			Object.assign(
				session,
				pick(
					getDefaultLearnSession(),
					"correctCount",
					"incorrectCount",
					"cardsToSave",
					"retryQueue",
				),
			);

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

watch(
	() => setting.types.length,
	() => {
		if (!setting.types.length) setting.types = ["multiple_choices"];
	},
);

watchDebounced(() => session.cardsToSave, handleSaveAnswers, {
	debounce: 1000,
	deep: true,
});

const submitAnswer = useThrottleFn((userAnswer: number | string) => {
	const question = session.currentQuestion;
	if (!question || questionState.isInReview) return;

	if (question.type === "multiple_choices" && typeof userAnswer === "number") {
		questionState.userChoiceIndex = userAnswer;
		questionState.isCorrect = userAnswer === question.correctChoiceIndex;
	}

	if (question.type === "written" && typeof userAnswer === "string") {
		const inputRef = userWrittenAnswerRef.value?.inputRef;
		if (inputRef) inputRef.blur();

		const res = evaluateAnswer(userAnswer, question.correctAnswer);
		console.log("🚀 ~ res:", res);

		const { result } = res;

		questionState.isCorrect =
			result === "correct" || result === "almost" || result === "typo";

		// TODO: finish this
	}

	questionState.isInReview = true;

	if (questionState.isCorrect) {
		session.correctCount++;
		setTimeout(() => nextQuestion(true, question), 500);
	} else {
		session.incorrectCount++;
		if (setting.showCorrectAnswer) return;

		setTimeout(() => nextQuestion(false, question), 500);
	}
}, 500);

function nextQuestion(isCorrect?: boolean, currentQuestion?: LearnQuestion) {
	if (!currentQuestion || isCorrect === undefined) return;

	const updated = updateCard(currentQuestion, isCorrect);

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
	Object.assign(questionState, getDefaultLearnQuestionState());

	focusInput(userWrittenAnswerRef.value?.inputRef);
}

async function handleSaveAnswers() {
	if (!session.cardsToSave.length) return;
	await saveAnswers();

	if (status.value === "success") {
		session.cardsToSave = [];
	}

	if (status.value === "error") {
		toast.saveAnswersFailed();
	}
}

async function handleCloseSettingModal() {
	if (JSON.stringify(setting) === snapshotSetting.value) return;

	snapshotSetting.reset();
	await store.fetchDeck();
}

// TODO: calculate next review date based on hint used count
function onGetAHint() {
	if (session.currentQuestion) {
		questionState.userAnswer = session.currentQuestion.correctAnswer.substring(
			0,
			questionState.hintUsedCount + 1,
		);

		questionState.hintUsedCount++;
	}

	focusInput(userWrittenAnswerRef.value?.inputRef);
}

function handleChoiceShortcut(index: number) {
	if (
		isIncorrect.value &&
		questionState.isInReview &&
		session.currentQuestion?.correctChoiceIndex === index
	) {
		nextQuestion(questionState.isCorrect, session.currentQuestion);
	} else {
		submitAnswer(index);
	}
}

function handleSkip() {
	if (!session.currentQuestion) return;

	submitAnswer(session.currentQuestion.type === "multiple_choices" ? -1 : "");
}

function getChoiceBtnClass(choiceIndex: number) {
	if (!session.currentQuestion) return "";

	const isThisChoiceSelected = questionState.userChoiceIndex === choiceIndex;
	const isThisChoiceCorrect =
		session.currentQuestion.correctChoiceIndex === choiceIndex;

	const successClass =
		"border-success bg-success/10 text-success hover:text-success hover:border-success hover:bg-success/10 hover:scale-102";

	if (questionState.isInReview) {
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
	if (!questionState.isInReview) return "";

	if (questionState.isCorrect) {
		return "border-success";
	}

	return "border-error";
}

function getChoiceDisabledState(choiceIndex: number) {
	if (!questionState.isInReview) return false;

	const question = session.currentQuestion;
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
	[ShortcutKey.LEARN_NEXT_QUESTION]: () =>
		nextQuestion(questionState.isCorrect, session.currentQuestion),
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
  <SkeletonLearnPage v-if="store.isFetchingDeck" />

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
            :label="session.incorrectCount"
            class="rounded-full px-2"
            variant="subtle"
            color="error"
          />

          <span class="text-error text-sm">Incorrect</span>
        </div>

        <div>
          {{ `${session.correctCount} / ${session.totalQuestions}` }}
        </div>

        <div class="flex place-items-center gap-2">
          <span class="text-success text-sm">Correct</span>

          <UBadge
            :label="session.correctCount"
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
          'bg-inherit p-0 ring-0': !smAndLarger,
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
                session.currentQuestion.direction === 'term_to_def'
                  ? `Term (${session.currentQuestion.termLanguage})`
                  : `Definition (${session.currentQuestion.definitionLanguage})`
              }}
            </span>

            <UButton
              v-if="session.currentQuestion.type === 'written'"
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
                v-for="(choice, choiceIndex) in session.currentQuestion.choices"
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
                :disabled="questionState.isInReview"
                variant="outline"
                color="neutral"
                autofocus
                @keydown.enter="submitAnswer(questionState.userAnswer)"
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
                :disabled="questionState.isInReview"
                class="cursor-pointer place-self-end font-medium"
                variant="ghost"
                color="error"
                tabindex="-1"
                @click="handleSkip"
              >
                Skip?
              </UButton>

              <UButton
                v-if="session.currentQuestion.type === 'written'"
                :disabled="!questionState.userAnswer"
                class="cursor-pointer font-medium"
                size="lg"
                @click="submitAnswer(questionState.userAnswer)"
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
            questionState.isInReview &&
            setting.showCorrectAnswer &&
            isIncorrect &&
            smAndLarger
          "
          class="place-self-center font-semibold"
        >
          Press
          <UKbd size="lg">Space</UKbd>

          or
          <UKbd
            v-if="session.currentQuestion.correctChoiceIndex > -1"
            size="lg"
          >
            {{ session.currentQuestion.correctChoiceIndex + 1 }}
          </UKbd>
          to continue.
        </div>

        <div v-else />

        <div class="flex place-items-center place-self-end">
          <UTooltip :delay-duration="200" text="Ignore review dates">
            <UButton
              :icon="`i-lucide-calendar${store.isIgnoreDate ? '-off' : ''}`"
              class="cursor-pointer"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="store.handleToggleIgnoreDate"
            />
          </UTooltip>

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

    <AppEmpty v-else />

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
</template>
