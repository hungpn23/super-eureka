import type { UUID } from "~/shared/types";

export type CardStatus = "known" | "learning" | "new";
export type QuestionType = "multiple_choices" | "written";
export type QuestionDirection = "term_to_def" | "def_to_term" | "both";
export type PreviewCard = Pick<Card, "term" | "definition">;
export type CardToSave = Pick<Card, "id" | "streak" | "reviewDate">;
export type CardToSync = Pick<Card, "id" | "reviewDate">;

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
