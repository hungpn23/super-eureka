import type { UUID } from "~/shared/types";

export type DeleteDeckOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
};
