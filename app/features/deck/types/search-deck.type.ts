import type { QueryOrder } from "../enums";

export type DeckOrderBy = "createdAt" | "openedAt" | "name";

export type DeckUrlParams = {
  page: string;
  limit: string;
  search: string;
  filter: string;
};

export type DeckSearchApiParams = {
  page: number;
  limit: string;
  search: string;
  orderBy: DeckOrderBy;
  order: QueryOrder;
};
