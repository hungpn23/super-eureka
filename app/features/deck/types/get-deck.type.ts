import type { Card } from "~/features/card";
import type { Deck, DeckStats } from "./common.type";

export type GetOneRes = Pick<Deck, "id" | "name" | "slug" | "description"> & {
	cards: Card[];
};
export type GetManyRes = Pick<
	Deck,
	"id" | "name" | "slug" | "visibility" | "openedAt"
> & {
	stats: DeckStats;
};
