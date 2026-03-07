import type { UUID } from "~/shared/types";

export type DeleteDeckOptions = {
	deckId: UUID | null;
	token: Ref<string | null>;
};
