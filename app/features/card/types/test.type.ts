import type { QuestionDirection, QuestionType } from "./common.type";
import type { LearnQuestion } from "./learn.type";

export type TestQuestion = Omit<LearnQuestion, "streak" | "reviewDate"> &
	Partial<{
		userAnswer: string;
		userChoiceIndex: number;
		isUserAnswerCorrect: boolean;
		isMarkedAsDontKnow: boolean;
	}>;

export type TestSession = {
	index: number;
	isSubmitted: boolean;
	questions: TestQuestion[];
	currentQuestion?: TestQuestion;
	input: HTMLInputElement | null;
	element: Element | null;
};

export type TestSetting = {
	questionAmount: number;
	isIgnoreDate: boolean;
	types: QuestionType[];
	direction: QuestionDirection;
};
