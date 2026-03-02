import type * as v from "valibot";
import type { UUID } from "~/shared/types";
import type { UPDATE_DECK_SCHEMA } from "../constants";

export type UpdateDeckSchema = v.InferOutput<typeof UPDATE_DECK_SCHEMA>;

export type UpdateDeckOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
	state: Partial<UpdateDeckSchema>;
};
