import type { PreviewCard } from "~/features/card";
import type { Owner } from "~/features/user";
import type { Paginated } from "~/shared/types";
import type { QueryOrder } from "../enums";
import type { Deck } from "./common.type";
import type { DeckOrderBy } from "./search-deck.type";

export type GetSharedDecksQuery = ComputedRef<{
	visitorId?: string;
	page: number;
	limit: string;
	search: string;
	orderBy: DeckOrderBy;
	order: QueryOrder;
}>;

export type GetSharedDecksOptions = {
	query: GetSharedDecksQuery;
	token: Ref<string | null>;
};

export type GetSharedDecksData = Pick<
	Deck,
	| "id"
	| "name"
	| "slug"
	| "visibility"
	| "viewCount"
	| "learnerCount"
	| "createdAt"
> & {
	totalCards: number;
	owner: Owner;
};

export type GetSharedDecksResponse = Paginated<GetSharedDecksData>;

export type GetSharedDeckDetailResponse = Pick<
	Deck,
	"id" | "name" | "description" | "visibility"
> & {
	totalCards: number;
	owner: Owner;
	cards: PreviewCard[];
};
