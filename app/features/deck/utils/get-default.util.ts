import type {
	FlashcardSession,
	LearnQuestionState,
	LearnSession,
	LearnSetting,
} from "~/features/card";

export function getDefaultFlashcardSession() {
	return {
		cardsToSave: [],
		savedCards: [],
		studyQueue: [],
		retryQueue: [],
		totalCards: 0,
		knownCount: 0,
		skippedCount: 0,
		isCardFlipped: false,
	} satisfies FlashcardSession;
}

export function getDefaultLearnSession() {
	return {
		currentQuestion: undefined,
		cardsToSave: [],
		studyQueue: [],
		retryQueue: [],
		totalQuestions: 0,
		correctCount: 0,
		incorrectCount: 0,
	} satisfies LearnSession;
}

export function getDefaultLearnQuestionState() {
	return {
		userAnswer: "",
		userChoiceIndex: -1,
		isInReview: false,
		isCorrect: undefined,
		hintUsedCount: 0,
	} satisfies LearnQuestionState;
}

export function getDefaultLearnSetting() {
	return {
		showCorrectAnswer: true,
		types: ["written", "multiple_choices"],
		direction: "term_to_def",
	} satisfies LearnSetting;
}
