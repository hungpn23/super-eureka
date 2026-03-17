import type { LANGUAGE_CODES } from "~/features/deck/enums";

export type ContentSeparator = "tab" | "comma" | "custom";
export type CardSeparator = "new_line" | "semicolon" | "custom";
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type TextareaRef = { textareaRef?: HTMLTextAreaElement | null } | null;
