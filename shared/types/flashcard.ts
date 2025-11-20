import type { Card, CardAnswer } from "./card";

export type FlashcardState = {
  totalCards: number;
  flashcards: Card[];
  answers: CardAnswer[];
  retryCards: Card[];
};
