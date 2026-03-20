import type {
  FlashcardSession,
  LearnQuestionState,
  LearnSession,
  LearnSetting,
  TestSession,
  TestSetting,
} from "../../types";

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
    isDisplayingReviewScreen: false,
    hintUsedCount: 0,
    answerStatus: undefined,
    answerDiffs: [],
  } satisfies LearnQuestionState;
}

export function getDefaultLearnSetting() {
  return {
    showCorrectAnswer: true,
    types: ["written"],
    direction: "term_to_def",
  } satisfies LearnSetting;
}

export function getDefaultTestSession() {
  return {
    currentQuestionIndex: 0,
    isSubmitted: false,
    questions: [],
    currentQuestion: undefined,
    questionInput: null,
    questionElement: null,
  } satisfies TestSession;
}

export function getDefaultTestSetting() {
  return {
    questionAmount: 0,
    types: ["multiple_choices", "written"],
    direction: "term_to_def",
  } satisfies TestSetting;
}
