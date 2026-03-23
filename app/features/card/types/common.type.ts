import type { LANGUAGE_CODES } from "~/features/deck";
import type { UUID } from "~/shared/types";
import type { CARD_STATUS } from "../constants";

export type Card = {
	id: UUID;
	term: string;
	termLanguage: LanguageCode;
	definition: string;
	definitionLanguage: LanguageCode;
	pronunciation?: string;
	partOfSpeech?: string;
	usageOrGrammar?: string;
	examples?: string[];
	streak: number;
	reviewDate?: string;
	status: CardStatus;
};

export type LanguageCode = (typeof LANGUAGE_CODES)[number];
export type CardStatus = (typeof CARD_STATUS)[number];
export type PreviewCard = Pick<Card, "term" | "definition">;
export type CardToSave = Pick<Card, "id" | "streak" | "reviewDate">;
export type CardToSync = Pick<Card, "id" | "reviewDate">;
