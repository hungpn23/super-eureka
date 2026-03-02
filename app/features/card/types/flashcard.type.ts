import type { Card, CardToSave } from "./common.type";

export type FlashcardSession = {
	currentCard?: Card;
	cardsToSave: CardToSave[];
	savedCards: CardToSave[];
	studyQueue: Card[];
	retryQueue: Card[];
	totalCards: number;
	knownCount: number;
	skippedCount: number;
	isCardFlipped: boolean;
};
