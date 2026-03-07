import { addDays, getDate, isAfter } from "date-fns";
import type {
	Card,
	CardStatus,
	FlashcardSession,
	LearnQuestion,
	LearnQuestionState,
	LearnSession,
	LearnSetting,
} from "~/features/card";
import { QUOTES } from "../constants";

export const getCardStatus = (reviewDate?: string | null): CardStatus => {
	const now = Date.now();

	if (!reviewDate) {
		return "new";
	} else if (Date.parse(reviewDate) > now) {
		return "known";
	} else {
		return "learning";
	}
};

export const shuffleArray = <T>(array: T[]) => {
	const arr = [...array];

	for (let i = arr.length - 1; i > 0; i--) {
		const random = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[random]] = [arr[random]!, arr[i]!];
	}

	return arr;
};

export const updateCard = <T extends Card | LearnQuestion>(
	q: T,
	isCorrect: boolean,
) => {
	const { streak, reviewDate, ...rest } = q;
	const now = new Date();

	if (!isCorrect) {
		return {
			...rest,
			streak: 0,
			reviewDate: now.toISOString(),
		};
	}

	const newStreak = streak + 1;

	const gap = 2 ** (newStreak - 1);

	const baseDate = reviewDate ? new Date(reviewDate) : now;

	const nextDate = addDays(baseDate, gap);

	const maxDate = addDays(now, 30);

	const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

	return {
		...rest,
		streak: newStreak,
		reviewDate: finalDate.toISOString(),
	};
};

export function getDailyQuote() {
	const currentDayInMonth = getDate(new Date());
	const index = currentDayInMonth % QUOTES.length;

	return QUOTES[index];
}

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
