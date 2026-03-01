import type { Card } from "~/features/card";
import type { UUID } from "~/shared/types";
import type { Deck, DeckStats } from "./common.type";

export type GetDeckDetailOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
};

export type GetDeckDetailResponse = Pick<
	Deck,
	"id" | "name" | "slug" | "description"
> & {
	cards: Card[];
};

export type GetManyRes = Pick<
	Deck,
	"id" | "name" | "slug" | "visibility" | "openedAt"
> & {
	stats: DeckStats;
};
