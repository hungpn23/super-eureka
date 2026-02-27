import type { SelectMenuItem } from "@nuxt/ui";
import * as v from "valibot";
import { LANGUAGE_CODES, Visibility } from "../deck";
import type { CardSeparator, ContentSeparator, LanguageCode } from "./types";
import { getVisibilityLabel } from "./utils";

export const CREATE_CARD_SCHEMA = v.object({
	term: v.pipe(v.string(), v.nonEmpty("Term is required")),
	termLanguage: v.picklist(LANGUAGE_CODES),
	definition: v.pipe(v.string(), v.nonEmpty("Definition is required")),
	definitionLanguage: v.picklist(LANGUAGE_CODES),
	pronunciation: v.optional(v.string()),
	partOfSpeech: v.optional(v.string()),
	usageOrGrammar: v.optional(v.string()),
	examples: v.array(v.pipe(v.string(), v.nonEmpty("Example cannot be empty"))),
});

export const CREATE_DECK_SCHEMA = v.object({
	name: v.pipe(v.string(), v.nonEmpty("Name is required")),
	description: v.string(),
	visibility: v.enum(Visibility),
	passcode: v.optional(
		v.pipe(
			v.string(),
			v.minLength(4, "Passcode must be at least 4 characters"),
			v.maxLength(20, "Passcode must be at most 20 characters"),
		),
	),
	cards: v.pipe(
		v.array(CREATE_CARD_SCHEMA),
		v.minLength(4, "At least 4 cards are required"),
	),
});

export const IMPORT_CARD_SCHEMA = v.object({
	input: v.pipe(v.string(), v.nonEmpty("Input is required")),
});

export const VISIBILITY_ITEMS = ref<(SelectMenuItem & { id: Visibility })[]>([
	{
		id: Visibility.PUBLIC,
		label: getVisibilityLabel(Visibility.PUBLIC),
	},
	{
		id: Visibility.PROTECTED,
		label: getVisibilityLabel(Visibility.PROTECTED),
	},
	{
		id: Visibility.PRIVATE,
		label: getVisibilityLabel(Visibility.PRIVATE),
	},
]);

export const CONTENT_SEPARATOR_ITEMS = ref<
	(SelectMenuItem & { id: ContentSeparator })[]
>([
	{
		id: "tab",
		label: "Tab",
	},
	{
		id: "comma",
		label: "Comma",
	},
	{
		id: "custom",
		label: "Custom",
	},
]);

export const CARD_SEPARATOR_ITEMS = ref<
	(SelectMenuItem & { id: CardSeparator })[]
>([
	{
		id: "new_line",
		label: "New line",
	},
	{
		id: "semicolon",
		label: "Semicolon",
	},
	{
		id: "custom",
		label: "Custom",
	},
]);

export const TERM_LANGUAGE_ITEMS = ref<
	(SelectMenuItem & { id: LanguageCode })[]
>([
	{
		id: "en",
		label: "English",
	},
	{
		id: "vi",
		label: "Vietnamese",
	},
]);

export const DEFINITION_LANGUAGE_ITEMS = ref<
	(SelectMenuItem & { id: LanguageCode })[]
>([
	{
		id: "en",
		label: "English",
	},
	{
		id: "vi",
		label: "Vietnamese",
	},
]);
