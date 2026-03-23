import type { SelectMenuItem } from "@nuxt/ui";

import { Visibility } from "../deck/enums";
import type { CardSeparator, ContentSeparator, LanguageCode } from "./types";
import { getVisibilityLabel } from "./utils";

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
