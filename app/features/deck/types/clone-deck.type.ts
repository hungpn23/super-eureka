import type * as v from "valibot";
import type { Reactive } from "vue";
import type { UUID } from "~/shared/types";
import type { CLONE_DECK_SCHEMA } from "../constants";

export type CloneDeckSchema = v.InferOutput<typeof CLONE_DECK_SCHEMA>;

export type CloneDeckOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
	state: Reactive<CloneDeckSchema>;
};
