import type { UUID } from "~/shared/types";
import type { Visibility } from "../enums";

export type Deck = {
	id: UUID;
	name: string;
	slug: string;
	description?: string | null;
	visibility: Visibility;
	viewCount: number;
	learnerCount: number;
	clonedFrom?: Pick<Deck, "id" | "name"> | null;
	openedAt?: string | null;
	createdAt: string;
};

export type DeckStats = {
	total: number;
	known: number;
	learning: number;
	new: number;
};
