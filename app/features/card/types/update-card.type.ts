import type * as v from "valibot";
import type { UPDATE_CARD_SCHEMA } from "../constants";

export type UpdateCardSchema = v.InferOutput<typeof UPDATE_CARD_SCHEMA>;
