import type { DeckOrderBy, Visibility } from "~/utils/enums";
import type { UUID } from "./branded";
import type { PaginationQuery } from "./pagination";
import type { Card } from "./card";

export type Deck = {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  visibility: Visibility;
  openedAt?: string;
};

export type DeckPaginationQuery = PaginationQuery & {
  orderBy?: DeckOrderBy;
};

export type DeckStats = {
  total: number;
  known: number;
  learning: number;
  unseen: number;
};

export type DeckWithCards = Deck & {
  cards: Card[];
  stats: DeckStats;
};

export type CreateDeckRes = Pick<Deck, "id" | "slug">;
