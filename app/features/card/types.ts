import type * as v from "valibot";
import type { UUID } from "~/shared/types";
import type { UPDATE_CARD_SCHEMA } from "./constants";

export type UpdateCardSchema = v.InferOutput<typeof UPDATE_CARD_SCHEMA>;

export type Card = {
	id: UUID;
	term: string;
	termLanguage: string;
	definition: string;
	definitionLanguage: string;
	pronunciation?: string;
	partOfSpeech?: string;
	usageOrGrammar?: string;
	examples: string[];
	streak: number;
	reviewDate?: string;
	status: CardStatus;
};
export type PreviewCard = Pick<Card, "term" | "definition">;
export type CardToSave = Pick<Card, "id" | "streak" | "reviewDate">;

// --- FLASHCARD ---
export type FlashcardSession = {
	currentCard?: Card | null;
	cardsToSave: CardToSave[];
	savedCards: CardToSave[];
	studyQueue: Card[];
	retryQueue: Card[];
	totalCards: number;
	knownCount: number;
	skippedCount: number;
};

// --- LEARN ---
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

// --- TEST ---
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

// --- SUGGESTION ---
export type CardSuggestion = {
	currentCardIndex: number;
	definition: string;
	pronunciation?: string;
	partOfSpeech?: string;
	usageOrGrammar?: string;
	examples: string[];
};

// --- COMMON ---
export type CardStatus = "known" | "learning" | "new";
export type QuestionType = "multiple_choices" | "written";
export type QuestionDirection = "term_to_def" | "def_to_term" | "both";
