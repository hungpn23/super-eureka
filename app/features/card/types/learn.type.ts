import type {
	Card,
	CardToSave,
	QuestionDirection,
	QuestionType,
} from "./common.type";

export type LearnQuestion = Pick<
	Card,
	"id" | "streak" | "reviewDate" | "termLanguage" | "definitionLanguage"
> & {
	type: QuestionType;
	direction: QuestionDirection;
	question: string;
	correctAnswer: string;
	choices: string[];
	correctChoiceIndex: number;
};

export type LearnSession = {
	isSavingAnswers: boolean;
	correctCount: number;
	incorrectCount: number;
	cardsToSave: CardToSave[];
	retryQueue: LearnQuestion[];
	studyQueue: LearnQuestion[];
	totalQuestions: number;
	currentQuestion?: LearnQuestion;
};

export type LearnQuestionState = {
	userAnswer: string;
	userChoiceIndex: number;
	isInReview: boolean;
	isCorrect?: boolean;
	hintUsedCount: number;
};

export type LearnSetting = {
	showCorrectAnswer: boolean;
	types: QuestionType[];
	direction: QuestionDirection;
};
