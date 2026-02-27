import type { Card, CardToSave } from "./common.type";

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
