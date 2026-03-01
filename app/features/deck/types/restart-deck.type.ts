import type { UUID } from "~/shared/types";

export type RestartDeckOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
};
