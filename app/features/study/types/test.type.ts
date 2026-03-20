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
  currentQuestionIndex: number;
  isSubmitted: boolean;
  questions: TestQuestion[];
  currentQuestion?: TestQuestion;
  questionInput: HTMLInputElement | null;
  questionElement: Element | null;
};

export type TestSetting = {
  questionAmount: number;
  types: QuestionType[];
  direction: QuestionDirection;
};
