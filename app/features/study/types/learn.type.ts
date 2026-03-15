import type { Card, CardToSave } from "~/features/card";
import type { QuestionDirection, QuestionType } from "./common.type";
import type { TokenDiff } from "./comparing.type";

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
	isDisplayingReviewScreen: boolean;
	hintUsedCount: number;
	answerTokenDiffs: TokenDiff[];
	answerStatus?: LearnAnswerStatus;
};

export type LearnAnswerStatus = "correct" | "typo" | "almost" | "incorrect";

export type LearnSetting = {
	showCorrectAnswer: boolean;
	types: QuestionType[];
	direction: QuestionDirection;
};
