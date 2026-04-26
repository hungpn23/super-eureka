<script setup lang="ts">
import type { CardSnapshot } from '~/features/study-group';

const props = defineProps<{
	cards: CardSnapshot[];
	questionTypes: string;
}>();

const emit = defineEmits<{
	answer: [cardId: string, answer: string | number, questionType: string];
}>();

type Question = {
	card: CardSnapshot;
	type: "multiple_choices" | "written";
	choices?: string[];
	correctIndex?: number;
};

const studyQueue = ref<Question[]>([]);
const retryQueue = ref<Question[]>([]);
const currentIndex = ref(0);
const userAnswer = ref("");
const feedback = ref<{ show: boolean; correct: boolean }>({
	show: false,
	correct: false,
});
const inputRef = useTemplateRef("answerInput");

const currentQuestion = computed(() => {
	const queue =
		studyQueue.value.length > 0 ? studyQueue.value : retryQueue.value;
	return queue[0] ?? null;
});

const completedCount = computed(() => {
	return props.cards.length - studyQueue.value.length - retryQueue.value.length;
});

onMounted(() => {
	generateQuestions();
});

function generateQuestions() {
	const questions: Question[] = [];
	const shuffled = [...props.cards].sort(() => Math.random() - 0.5);

	for (const card of shuffled) {
		const type = getQuestionType();
		if (type === "multiple_choices") {
			const otherCards = shuffled.filter((c) => c.id !== card.id);
			const wrongAnswers = otherCards
				.sort(() => Math.random() - 0.5)
				.slice(0, 3)
				.map((c) => c.definition);

			const allChoices = [...wrongAnswers, card.definition].sort(
				() => Math.random() - 0.5,
			);
			const correctIndex = allChoices.indexOf(card.definition);

			questions.push({
				card,
				type: "multiple_choices",
				choices: allChoices,
				correctIndex,
			});
		} else {
			questions.push({ card, type: "written" });
		}
	}

	studyQueue.value = questions;
}

function getQuestionType(): "multiple_choices" | "written" {
	if (props.questionTypes === "multiple_choices") return "multiple_choices";
	if (props.questionTypes === "written") return "written";
	return Math.random() > 0.5 ? "multiple_choices" : "written";
}

function selectChoice(index: number) {
	if (!currentQuestion.value || feedback.value.show) return;

	const question = currentQuestion.value;
	const isCorrect = index === question.correctIndex;

	emit("answer", question.card.id, index, "multiple_choices");
	showFeedback(isCorrect);
}

function submitWritten() {
	if (!currentQuestion.value || !userAnswer.value.trim() || feedback.value.show)
		return;

	const answer = userAnswer.value.trim();
	emit("answer", currentQuestion.value.card.id, answer, "written");
	// We don't know if it's correct yet — the server tells us via answerResult
	// For simplicity, advance and let the server handle retry logic
	showFeedback(true); // Optimistic — real result comes from server
}

function showFeedback(correct: boolean) {
	feedback.value = { show: true, correct };

	setTimeout(() => {
		feedback.value = { show: false, correct: false };
		advanceQuestion(correct);
	}, 500);
}

function advanceQuestion(wasCorrect: boolean) {
	const queue =
		studyQueue.value.length > 0 ? studyQueue.value : retryQueue.value;
	const current = queue.shift();

	if (!wasCorrect && current) {
		retryQueue.value.push(current);
	}

	userAnswer.value = "";
	nextTick(() => {
		(inputRef.value as any)?.focus();
	});
}

const shortcutKeys = ["1", "2", "3", "4"];

function handleKeydown(e: KeyboardEvent) {
	if (
		currentQuestion.value?.type === "multiple_choices" &&
		shortcutKeys.includes(e.key)
	) {
		selectChoice(Number(e.key) - 1);
	}
}

onMounted(() => {
	window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
	window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
	<UCard v-if="currentQuestion">
		<div class="space-y-6">
			<!-- Progress -->
			<div class="text-center text-sm text-gray-500">
				{{ completedCount + 1 }} / {{ cards.length }}
			</div>

			<!-- Term -->
			<div class="text-center">
				<p class="text-2xl font-bold">{{ currentQuestion.card.term }}</p>
				<p class="mt-1 text-sm text-gray-500">
					{{ currentQuestion.card.termLanguage }}
				</p>
			</div>

			<!-- Feedback -->
			<div
				v-if="feedback.show"
				class="text-center text-lg font-semibold"
				:class="feedback.correct ? 'text-green-500' : 'text-red-500'"
			>
				{{ feedback.correct ? "Correct!" : "Incorrect" }}
			</div>

			<!-- MCQ -->
			<div
				v-if="currentQuestion.type === 'multiple_choices' && currentQuestion.choices"
				class="grid grid-cols-2 gap-3"
			>
				<UButton
					v-for="(choice, idx) in currentQuestion.choices"
					:key="idx"
					:label="`${idx + 1}. ${choice}`"
					color="neutral"
					variant="outline"
					block
					:disabled="feedback.show"
					@click="selectChoice(idx)"
				/>
			</div>

			<!-- Written -->
			<div v-else class="flex gap-2">
				<UInput
					ref="answerInput"
					v-model="userAnswer"
					placeholder="Type your answer"
					class="flex-1"
					:disabled="feedback.show"
					@keyup.enter="submitWritten"
				/>
				<UButton
					label="Submit"
					:disabled="!userAnswer.trim() || feedback.show"
					@click="submitWritten"
				/>
			</div>
		</div>
	</UCard>
</template>
