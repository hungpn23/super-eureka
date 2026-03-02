import type { CardToSave } from "~/features/card";
import type { UUID } from "~/shared/types";

export type SaveAnswersOptions = {
	deckId: UUID | null;
	token: Ref<string | null>;
	cardsToSave: CardToSave[];
};
