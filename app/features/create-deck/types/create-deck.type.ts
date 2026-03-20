import type { Deck } from "~/features/deck";

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
