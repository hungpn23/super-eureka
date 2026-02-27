import type { Deck } from "~/features/deck";
import type { CreateDeckSchema } from "./common.type";

export type CreateDeckOptions = {
	data: CreateDeckSchema;
	token: Ref<string | null>;
};

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
