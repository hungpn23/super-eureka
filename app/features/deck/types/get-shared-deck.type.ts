import type { PreviewCard } from "~/features/card";
import type { Owner } from "~/features/user";
import type { Paginated } from "~/shared/types";
import type { Deck } from "./common.type";

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

export type GetSharedDeckResponse = Pick<
	Deck,
	"id" | "name" | "description" | "visibility"
> & {
	totalCards: number;
	owner: Owner;
	cards: PreviewCard[];
};
