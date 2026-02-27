import type * as v from "valibot";
import type { LANGUAGE_CODES } from "~/features/deck";
import type {
	CREATE_CARD_SCHEMA,
	CREATE_DECK_SCHEMA,
	IMPORT_CARD_SCHEMA,
} from "../constants";

export type ContentSeparator = "tab" | "comma" | "custom";
export type CardSeparator = "new_line" | "semicolon" | "custom";
export type LanguageCode = (typeof LANGUAGE_CODES)[number];
export type CreateCardSchema = v.InferOutput<typeof CREATE_CARD_SCHEMA>;
export type CreateDeckSchema = v.InferOutput<typeof CREATE_DECK_SCHEMA>;
export type ImportCardsSchema = v.InferOutput<typeof IMPORT_CARD_SCHEMA>;
export type TextareaRef = { textareaRef?: HTMLTextAreaElement | null } | null;
