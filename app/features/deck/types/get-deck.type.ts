import type { Card } from "~/features/card";
import type { Paginated, UUID } from "~/shared/types";
import type { QueryOrder } from "../enums";
import type { Deck, DeckStats } from "./common.type";
import type { DeckOrderBy } from "./search-deck.type";

export type GetDecksOptions = {
  query: ComputedRef<{
    page: number;
    limit: string;
    search: string;
    orderBy: DeckOrderBy;
    order: QueryOrder;
  }>;

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
