<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import type { UCard } from "#components";
import { QUESTION_DIRECTION_ITEMS, QUESTION_TYPE_ITEMS } from "~/features/deck";
import {
	generateQuestions,
	getDefaultTestSession,
	getDefaultTestSetting,
	type TestQuestion,
	type TestSession,
	type TestSetting,
} from "~/features/study";
import { ShortcutKey } from "~/shared/enums";
import { focusInput, getCards, shuffleArray } from "~/shared/utils";

const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const store = useDeckStore();

const questionRefs = useTemplateRef("questionCards");
const isSettingModalOpen = ref(false);
const snapshotSetting = refManualReset("");
const setting = reactive<TestSetting>(getDefaultTestSetting());
const session = reactive<TestSession>(getDefaultTestSession());

watch([() => session.questions, () => session.currentQuestionIndex], () => {
	session.currentQuestion = session.questions[session.currentQuestionIndex];
});

watch(
	[() => questionRefs.value?.length, () => session.currentQuestionIndex],
	() => {
		if (questionRefs.value?.length) {
			session.questionElement = questionRefs.value[session.currentQuestionIndex]
				?.$el as Element;
		}
	},
);

watch(
	[
		() => store.deck?.cards,
		() => setting.isIgnoreDate,
		() => setting.questionAmount,
	],
	([newCards, newIsIgnoreDate]) => {
		if (newCards && newCards.length > 0) {
			session.questionInput = null;
			session.currentQuestionIndex = 0;
			session.isSubmitted = false;

			const filteredCards = getCards(newCards, newIsIgnoreDate);

			if (
				setting.questionAmount === 0 ||
				setting.questionAmount > filteredCards.length
			) {
				setting.questionAmount = filteredCards.length;
			}

			session.questions = generateQuestions<TestQuestion>({
				cards: shuffleArray(newCards).slice(0, setting.questionAmount),
				types: setting.types,
				dir: setting.direction,
				answerPool: newCards,
			});
		}
	},
);

watch(() => session.currentQuestionIndex, scrollAndFocusQuestion);

watch(
	() => setting.types.length,
	(length) => {
		if (!length) setting.types = ["multiple_choices"];
	},
);

const handleChoiceSelected = useThrottleFn(
	(choiceIndex: number, questionIndex: number, question?: TestQuestion) => {
		if (!question) return;

		question.userChoiceIndex = choiceIndex;
		question.isUserAnswerCorrect = choiceIndex === question.correctChoiceIndex;
		session.currentQuestionIndex = questionIndex;
		handleChangeQuestion("right");
	},
	500,
);

function scrollAndFocusQuestion() {
	if (session.questionElement) {
		session.questionElement.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		const oldInput = session.questionInput;
		if (oldInput) oldInput.blur();

		const newInput = session.questionElement.querySelector("input");
		if (newInput) {
			session.questionInput = newInput;
			return focusInput(newInput);
		}

		session.questionInput = null;
	}
}

function handleChangeQuestion(dir: "left" | "right") {
	if (!questionRefs.value?.length) return;

	if (dir === "left" && session.currentQuestionIndex > 0) {
		session.currentQuestionIndex--;
	}

	if (
		dir === "right" &&
		session.currentQuestionIndex < questionRefs.value.length - 1
	) {
		session.currentQuestionIndex++;
	}
}

async function handleSettingClosed() {
	if (JSON.stringify(setting) === snapshotSetting.value) {
		scrollAndFocusQuestion();
		return;
	}

	snapshotSetting.reset();
	await store.fetchDeck();
	scrollAndFocusQuestion();
}

function handleWrittenAnswerBlur(question: TestQuestion) {
	if (!question.userAnswer) return;

	question.userAnswer = question.userAnswer.trim();
	question.isUserAnswerCorrect =
		question.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
}

function handleDontKnowClicked(question: TestQuestion, questionIndex: number) {
	if (question.isMarkedAsDontKnow) return;

	question.isMarkedAsDontKnow = true;
	question.isUserAnswerCorrect = true;
	session.currentQuestionIndex = questionIndex;
	handleChangeQuestion("right");
}

function handleTestSubmitted() {
	session.isSubmitted = true;
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function getChoiceBtnClass(question: TestQuestion, choiceIndex: number) {
	const isThisChoiceSelected = question.userChoiceIndex === choiceIndex;
	const isThisChoiceCorrect = question.correctChoiceIndex === choiceIndex;

	if (!session.isSubmitted) {
		if (isThisChoiceSelected) {
			return "border-primary bg-primary/10 text-primary";
		}

		return "";
	}

	if (isThisChoiceSelected) {
		if (isThisChoiceCorrect) {
			return "border-success bg-success/10 text-success";
		}

		return "border-error bg-error/10 text-error";
	} else {
		if (isThisChoiceCorrect) {
			return "border-dashed border-success bg-success/10 text-success";
		}

		return "opacity-70";
	}
}

function getWrittenInputClass(question: TestQuestion) {
	if (!session.isSubmitted) return "";
	return question.isUserAnswerCorrect ? "border-success" : "border-error";
}

defineShortcuts({
	[ShortcutKey.CHOICE_1]: () =>
		handleChoiceSelected(
			0,
			session.currentQuestionIndex,
			session.currentQuestion,
		),
	[ShortcutKey.CHOICE_2]: () =>
		handleChoiceSelected(
			1,
			session.currentQuestionIndex,
			session.currentQuestion,
		),
	[ShortcutKey.CHOICE_3]: () =>
		handleChoiceSelected(
			2,
			session.currentQuestionIndex,
			session.currentQuestion,
		),
	[ShortcutKey.CHOICE_4]: () =>
		handleChoiceSelected(
			3,
			session.currentQuestionIndex,
			session.currentQuestion,
		),

	[ShortcutKey.PREV_CARD]: {
		handler: () => handleChangeQuestion("left"),
		usingInput: true,
	},

	[ShortcutKey.NEXT_CARD]: {
		handler: () => handleChangeQuestion("right"),
		usingInput: true,
	},
});

onMounted(() => {
	isSettingModalOpen.value = true;
});
</script>

<template>
  <SkeletonTestPage v-if="store.isFetchingDeck" />

  <UContainer v-else>
    <div class="flex place-content-between place-items-center gap-2">
      <UButton
        :to="`/library/${store.slug}?deckId=${store.deckId}`"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        icon="i-lucide-move-left"
        label="Back to Home"
      />

      <div class="flex place-items-center place-self-end">
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

    <div v-if="session.questions.length" class="flex w-full flex-col gap-4">
      <h1
        class="mb-2 max-w-5/6 place-self-center truncate text-lg font-semibold sm:text-xl"
      >
        {{ store.deck?.name }}
      </h1>

      <UCard
        v-for="(question, questionIndex) in session.questions"
        :key="questionIndex"
        ref="questionCards"
        :ui="{
          header: 'p-0 sm:px-0',
          body: `flex-1 w-full flex flex-col gap-4 p-2`,
        }"
        class="bg-elevated mb-2 flex min-h-[30dvh] flex-col divide-none shadow-md transition-all sm:mb-4"
        @click="session.currentQuestionIndex = questionIndex"
      >
        <div class="flex w-full place-content-between place-items-center">
          <span class="flex place-items-center gap-1">
            <UButton
              class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
              icon="i-lucide-volume-2"
              variant="soft"
              color="neutral"
              tabindex="-1"
            />

            {{
              setting.direction === 'term_to_def'
                ? `Term (${question.termLanguage})`
                : `Definition (${question.definitionLanguage})`
            }}
          </span>

          <UBadge
            :label="`${questionIndex + 1} of ${session.questions.length}`"
            variant="soft"
            color="neutral"
          />
        </div>

        <p class="text-xl font-medium sm:text-2xl">
          {{ question.question }}
        </p>

        <div class="mt-2 flex w-full flex-col gap-2">
          <em class="text-sm font-medium">
            {{
              question.type === 'multiple_choices'
                ? 'Choose an answer'
                : 'Type your answer'
            }}
          </em>

          <!-- Multiple Choices Answer -->
          <div
            v-if="question.type === 'multiple_choices'"
            class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
          >
            <button
              v-for="(choice, choiceIndex) in question.choices"
              :key="choiceIndex"
              :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none disabled:opacity-70 ${getChoiceBtnClass(question, choiceIndex)}`"
              :disabled="session.isSubmitted || question.isMarkedAsDontKnow"
              @click.stop="handleChoiceSelected(choiceIndex, questionIndex, question)"
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
              v-model="question.userAnswer"
              :ui="{
                base: `text-lg sm:text-xl transition-all border-2 border-default ring-0 ring-transparent disabled:opacity-70 ${getWrittenInputClass(question)}`,
              }"
              :disabled="session.isSubmitted || question.isMarkedAsDontKnow"
              variant="outline"
              color="neutral"
              @keydown.enter="handleChangeQuestion('right')"
              @blur="handleWrittenAnswerBlur(question)"
              @click.stop="session.currentQuestionIndex = questionIndex"
            />

            <UInput
              v-if="!question.isUserAnswerCorrect && session.isSubmitted"
              :ui="{
                base: `text-lg sm:text-xl transition-all border-2 border-dashed border-success ring-0`,
              }"
              :default-value="question.correctAnswer"
              disabled
            />
          </div>

          <UButton
            v-if="!question.isMarkedAsDontKnow && !session.isSubmitted"
            class="cursor-pointer place-self-end font-medium"
            variant="ghost"
            tabindex="-1"
            @click.stop="handleDontKnowClicked(question, questionIndex)"
          >
            Mark as "Don't know"
          </UButton>
        </div>
      </UCard>

      <UButton
        v-if="!session.isSubmitted"
        class="hover:bg-primary w-fit cursor-pointer place-self-center font-normal transition-all hover:scale-103 active:scale-98"
        label="Submit Test"
        icon="i-lucide-send-horizontal"
        size="xl"
        @click="handleTestSubmitted"
      />
    </div>

    <UModal
      v-model:open="isSettingModalOpen"
      :fullscreen="!smAndLarger"
      :ui="{
        content: 'divide-none',
        body: 'flex-initial pt-0 sm:pt-0',
        footer: 'place-content-end',
      }"
      description="Let's customize your test"
      @after:enter="snapshotSetting = JSON.stringify(setting)"
      @after:leave="handleSettingClosed"
    >
      <template #title>
        <span class="text-xl font-semibold sm:text-2xl"> Test settings </span>
      </template>

      <template #body>
        <div class="flex flex-col gap-2 font-medium">
          <div class="flex place-content-between place-items-center gap-2">
            <div>Number of questions</div>

            <UInput
              v-model.number="setting.questionAmount"
              type="number"
              size="lg"
            />
          </div>

          <div class="flex place-content-between place-items-center gap-2">
            <div>Test all questions</div>

            <USwitch v-model="setting.isIgnoreDate" />
          </div>

          <USeparator label="Answer format" />

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
          label="Apply"
          color="neutral"
          size="lg"
          @click="isSettingModalOpen = false"
        />
      </template>
    </UModal>
  </UContainer>
</template>
