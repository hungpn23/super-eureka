import type { PreviewCard } from "~/features/card";
import type { Owner } from "~/features/user";
import type { Paginated, UUID } from "~/shared/types";
import type { QueryOrder } from "../enums";
import type { Deck } from "./common.type";
import type { DeckOrderBy } from "./search-deck.type";

export type GetSharedDecksOptions = {
	query: ComputedRef<{
		visitorId?: string;
		page: number;
		limit: string;
		search: string;
		orderBy: DeckOrderBy;
		order: QueryOrder;
	}>;

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

export type GetSharedDeckOptions = {
	deckId: Ref<UUID | null>;
	token: Ref<string | null>;
};

export type GetSharedDeckResponse = Pick<
	Deck,
	"id" | "name" | "description" | "visibility"
> & {
	totalCards: number;
	owner: Owner;
	cards: PreviewCard[];
};
