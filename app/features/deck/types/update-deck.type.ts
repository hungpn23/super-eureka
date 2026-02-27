import type * as v from "valibot";
import type { UPDATE_DECK_SCHEMA } from "../constants";

export type UpdateDeckSchema = v.InferOutput<typeof UPDATE_DECK_SCHEMA>;
