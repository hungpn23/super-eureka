import type { Card } from "~/features/card";
import type { Paginated } from "~/shared/types";
import type { Deck, DeckStats } from "./common.type";

export type GetDecksData = Pick<
  Deck,
  "id" | "name" | "slug" | "visibility" | "openedAt"
> & {
  stats: DeckStats;
};

export type GetDecksResponse = Paginated<GetDecksData>;

export type GetDeckResponse = Pick<
  Deck,
  "id" | "name" | "slug" | "description" | "visibility" | "passcode"
> & {
  cards: Card[];
};

