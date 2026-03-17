import type * as v from "valibot";
import type { UPDATE_CARD_SCHEMA } from "~/features/card";
import type { UUID } from "~/shared/types";
import type { UPDATE_DECK_SCHEMA } from "../constants";

export type UpdateDeckSchema = v.InferOutput<typeof UPDATE_DECK_SCHEMA>;
export type UpdateCardSchema = v.InferOutput<typeof UPDATE_CARD_SCHEMA>;

export type UpdateDeckOptions = {
  deckId: UUID | null;
  token: Ref<string | null>;
  body: Partial<UpdateDeckSchema>;
};
