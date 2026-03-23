import type { UUID } from "~/shared/types";
import type { Visibility } from "../enums";

export type Deck = {
	id: UUID;
	name: string;
	slug: string;
	description?: string;
	visibility: Visibility;
	passcode: string;
	viewCount: number;
	learnerCount: number;
	clonedFrom?: Pick<Deck, "id" | "name">;
	openedAt?: string;
	createdAt: string;
};

export type DeckStats = {
	total: number;
	known: number;
	learning: number;
	new: number;
};
