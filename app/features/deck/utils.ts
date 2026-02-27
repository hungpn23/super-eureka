import { addDays, getDate, isAfter } from "date-fns";
import { pick } from "lodash";
import type {
	Card,
	CardStatus,
	LearnQuestion,
	QuestionDirection,
	QuestionType,
	TestQuestion,
} from "~/features/card";
import { QUOTES } from "./constants";

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

export const generateQuestions = <
	T extends LearnQuestion | TestQuestion,
>(options: {
	cards: Card[];
	types: QuestionType[];
	dir: QuestionDirection;
	answerPool: Card[];
}): T[] => {
	const { cards, types, dir, answerPool } = options;
	if (answerPool.length < 4) return [];

	const questions: T[] = [];

	for (const card of cards) {
		const random = Math.random();
		const type = types[Math.floor(random * types.length)]!;

		let direction: QuestionDirection;
		if (dir === "both") {
			direction = random < 0.5 ? "term_to_def" : "def_to_term";
		} else {
			direction = dir;
		}

		const isTermToDef = direction === "term_to_def";

		let question: string;
		let answer: string;
		if (isTermToDef) {
			question = card.term;
			answer = card.definition;
		} else {
			question = card.definition;
			answer = card.term;
		}

		let choices: string[] | undefined;
		let correctChoiceIndex: number | undefined;
		if (type === "multiple_choices") {
			const result = [answer];

			const wrongAnswers = shuffleArray(
				answerPool.filter((c) => c.id !== card.id),
			);

			for (let i = 0; i < 3; i++) {
				const wrongAnswer = isTermToDef
					? wrongAnswers[i]!.definition
					: wrongAnswers[i]!.term;

				result.push(wrongAnswer);
			}

			choices = shuffleArray(result);
			correctChoiceIndex = choices.indexOf(answer);
		}

		questions.push({
			...pick(card, [
				"id",
				"streak",
				"reviewDate",
				"termLanguage",
				"definitionLanguage",
			]),
			type,
			direction,
			question,
			correctAnswer: answer,
			choices,
			correctChoiceIndex,
		} as T);
	}

	return questions;
};
