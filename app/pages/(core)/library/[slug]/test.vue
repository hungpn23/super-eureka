<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import { diffChars } from "diff";
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
import { evaluateWrittenAnswer } from "~/features/study/utils/scoring/evaluateWrittenAnswer";
import { ShortcutKey } from "~/shared/enums";
import { focusInput, getCards, shuffleArray } from "~/shared/utils";

const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const store = useDeckStore();

const questionRefs = useTemplateRef("questionCards");
const isSettingModalOpen = ref(false);
const snapshotSetting = refManualReset("");
const setting = reactive<TestSetting>(getDefaultTestSetting());
const testSession = reactive<TestSession>(getDefaultTestSession());

const homeUrl = computed(() => `/library/${store.slug}?deckId=${store.deckId}`);

watch(
	[() => testSession.questions, () => testSession.currentQuestionIndex],
	() => {
		testSession.currentQuestion =
			testSession.questions[testSession.currentQuestionIndex];
	},
);

watch(
	[() => questionRefs.value?.length, () => testSession.currentQuestionIndex],
	() => {
		if (questionRefs.value?.length) {
			testSession.questionElement = questionRefs.value[
				testSession.currentQuestionIndex
			]?.$el as Element;
		}
	},
);

watch([() => store.deck?.cards, () => setting.questionAmount], ([newCards]) => {
	if (newCards && newCards.length > 0) {
		testSession.questionInput = null;
		testSession.currentQuestionIndex = 0;
		testSession.isSubmitted = false;

		const filteredCards = getCards(newCards);

		if (
			!setting.questionAmount ||
			setting.questionAmount > filteredCards.length
		) {
			setting.questionAmount = filteredCards.length;
		}

		testSession.questions = generateQuestions<TestQuestion>({
			cards: shuffleArray(newCards).slice(0, setting.questionAmount),
			types: setting.types,
			dir: setting.direction,
			answerPool: newCards,
		});
	}
});

watch(() => testSession.currentQuestionIndex, scrollAndFocusQuestion);

watch(
	() => setting.types.length,
	() => {
		if (!setting.types.length) setting.types = ["multiple_choices"];
	},
);

const handleChoiceSelected = useThrottleFn(
	(choiceIndex: number, questionIndex: number, question?: TestQuestion) => {
		if (!question) return;

		question.userChoiceIndex = choiceIndex;
		question.answerStatus =
			choiceIndex === question.correctChoiceIndex ? "correct" : "incorrect";
		testSession.currentQuestionIndex = questionIndex;
		handleChangeQuestion("right");
	},
	500,
);

function scrollAndFocusQuestion() {
	if (testSession.questionElement) {
		testSession.questionElement.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		const oldInput = testSession.questionInput;
		if (oldInput) oldInput.blur();

		const newInput = testSession.questionElement.querySelector("input");
		if (newInput) {
			testSession.questionInput = newInput;
			return focusInput(newInput);
		}

		testSession.questionInput = null;
	}
}

function handleChangeQuestion(dir: "left" | "right") {
	if (!questionRefs.value?.length) return;

	if (dir === "left" && testSession.currentQuestionIndex > 0) {
		testSession.currentQuestionIndex--;
	}

	if (
		dir === "right" &&
		testSession.currentQuestionIndex < questionRefs.value.length - 1
	) {
		testSession.currentQuestionIndex++;
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
}

function evaluateWrittenQuestion(question: TestQuestion) {
	if (!question.userAnswer?.trim() || question.type !== "written") return;

	const userAnswer = question.userAnswer.trim();
	const result = evaluateWrittenAnswer(userAnswer, question.correctAnswer);

	question.answerStatus = result.status;
	question.answerDiffs =
		result.status === "correct"
			? []
			: diffChars(userAnswer, question.correctAnswer);
}

function handleDontKnowClicked(question: TestQuestion, questionIndex: number) {
	if (question.isMarkedAsDontKnow) return;

	question.isMarkedAsDontKnow = true;
	question.answerStatus = "incorrect";
	testSession.currentQuestionIndex = questionIndex;
	handleChangeQuestion("right");
}

function handleTestSubmitted() {
	for (const question of testSession.questions) {
		if (question.type === "written") {
			if (question.isMarkedAsDontKnow || !question.userAnswer?.trim()) {
				question.answerStatus = "incorrect";
				question.answerDiffs = diffChars("", question.correctAnswer);
			} else {
				evaluateWrittenQuestion(question);
			}
		}

		if (question.type === "multiple_choices" && !question.answerStatus) {
			question.answerStatus = "incorrect";
		}
	}

	testSession.isSubmitted = true;
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function getChoiceBtnClass(question: TestQuestion, choiceIndex: number) {
	const isThisChoiceSelected = question.userChoiceIndex === choiceIndex;
	const isThisChoiceCorrect = question.correctChoiceIndex === choiceIndex;

	if (!testSession.isSubmitted) {
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
	if (!testSession.isSubmitted) return "";

	if (question.answerStatus === "typo" || question.answerStatus === "almost") {
		return "border-warning";
	}

	return question.answerStatus === "correct"
		? "border-success"
		: "border-error";
}

defineShortcuts({
	[ShortcutKey.CHOICE_1]: () =>
		handleChoiceSelected(
			0,
			testSession.currentQuestionIndex,
			testSession.currentQuestion,
		),
	[ShortcutKey.CHOICE_2]: () =>
		handleChoiceSelected(
			1,
			testSession.currentQuestionIndex,
			testSession.currentQuestion,
		),
	[ShortcutKey.CHOICE_3]: () =>
		handleChoiceSelected(
			2,
			testSession.currentQuestionIndex,
			testSession.currentQuestion,
		),
	[ShortcutKey.CHOICE_4]: () =>
		handleChoiceSelected(
			3,
			testSession.currentQuestionIndex,
			testSession.currentQuestion,
		),

	[ShortcutKey.PREV_CARD]: {
		handler: () => handleChangeQuestion("left"),
		usingInput: true,
	},

	[ShortcutKey.NEXT_CARD]: {
		handler: () => handleChangeQuestion("right"),
		usingInput: true,
	},

	[ShortcutKey.MARK_AS_DONT_KNOW]: {
		handler: () =>
			handleDontKnowClicked(
				testSession.currentQuestion!,
				testSession.currentQuestionIndex,
			),
		usingInput: true,
	},
});

onMounted(() => {
	isSettingModalOpen.value = true;
});
</script>

<template>
	<UContainer v-if="testSession.questions.length">
		<div class="flex place-content-between place-items-center gap-2">
			<UButton
				:to="homeUrl"
				class="px-0"
				variant="link"
				label="Home"
				icon="i-lucide-move-left"
				size="lg"
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

		<div class="flex w-full flex-col gap-4">
			<h1
				class="mb-2 max-w-5/6 place-self-center truncate text-lg font-semibold sm:text-xl"
			>
				{{ store.deck?.name }}
			</h1>

			<UCard
				v-for="(question, questionIndex) in testSession.questions"
				:key="questionIndex"
				ref="questionCards"
				:ui="{
          header: 'p-0 sm:px-0',
          body: `flex-1 w-full flex flex-col gap-4 p-2`,
        }"
				class="bg-elevated mb-2 flex min-h-[30dvh] flex-col divide-none shadow-md transition-all sm:mb-4"
				@click="testSession.currentQuestionIndex = questionIndex"
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

						{{ setting.direction === "term_to_def"
                ? `Term (${question.termLanguage})`
                : `Definition (${question.definitionLanguage})` }}
					</span>

					<UBadge
						:label="`${questionIndex + 1} of ${testSession.questions.length}`"
						variant="soft"
						color="neutral"
					/>
				</div>

				<p class="text-xl font-medium sm:text-2xl">{{ question.question }}</p>

				<div class="mt-2 flex w-full flex-col gap-2">
					<em class="text-sm font-medium">
						{{ question.type === "multiple_choices"
                ? "Choose an answer"
                : "Type your answer" }}
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
							:disabled="testSession.isSubmitted || question.isMarkedAsDontKnow"
							@click.stop="
                handleChoiceSelected(choiceIndex, questionIndex, question)
              "
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
							:disabled="testSession.isSubmitted || question.isMarkedAsDontKnow"
							variant="outline"
							color="neutral"
							@keydown.enter="handleChangeQuestion('right')"
							@blur="handleWrittenAnswerBlur(question)"
							@click.stop="testSession.currentQuestionIndex = questionIndex"
						/>

						<StudyAnswerDiff
							v-if="testSession.isSubmitted && question.answerDiffs?.length"
							:diffs="question.answerDiffs"
						/>
					</div>

					<UButton
						v-if="!question.isMarkedAsDontKnow && !testSession.isSubmitted"
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
				v-if="!testSession.isSubmitted"
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
