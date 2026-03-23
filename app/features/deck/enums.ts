export enum Visibility {
	PUBLIC = "public",
	PROTECTED = "protected",
	PRIVATE = "private",
}

export const LANGUAGE_CODES = ["en", "vi"] as const;

// https://github.com/mikro-orm/mikro-orm/blob/master/packages/core/src/enums.ts#L73
export enum QueryOrder {
	ASC = "ASC",
	ASC_NULLS_LAST = "ASC NULLS LAST",
	ASC_NULLS_FIRST = "ASC NULLS FIRST",
	DESC = "DESC",
	DESC_NULLS_LAST = "DESC NULLS LAST",
	DESC_NULLS_FIRST = "DESC NULLS FIRST",
	asc = "asc",
	asc_nulls_last = "asc nulls last",
	asc_nulls_first = "asc nulls first",
	desc = "desc",
	desc_nulls_last = "desc nulls last",
	desc_nulls_first = "desc nulls first",
}

export enum DeckFormId {
	CLONE_DECK = "clone_deck",
	UPDATE_DECK = "update_deck",
	UPDATE_VISIBILITY = "update_visibility",
}
