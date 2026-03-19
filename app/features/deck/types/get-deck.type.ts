import type { Card } from "~/features/card";
import type { Paginated, UUID } from "~/shared/types";
import type { Deck, DeckStats } from "./common.type";
import type { DeckSearchApiParams } from "./search-deck.type";

export type GetDecksOptions = {
  query: ComputedRef<DeckSearchApiParams>;
  token: Ref<string | null>;
};

export type GetDecksData = Pick<
  Deck,
  "id" | "name" | "slug" | "visibility" | "openedAt"
> & {
  stats: DeckStats;
};

export type GetDecksResponse = Paginated<GetDecksData>;

export type GetDeckOptions = {
  deckId: Ref<UUID | null>;
  token: Ref<string | null>;
};

export type GetDeckResponse = Pick<
  Deck,
  "id" | "name" | "slug" | "description" | "visibility" | "passcode"
> & {
  cards: Card[];
};
