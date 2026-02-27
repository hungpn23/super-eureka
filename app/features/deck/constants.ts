import * as v from "valibot";
import { UPDATE_CARD_SCHEMA } from "../card";

export const CLONE_DECK_SCHEMA = v.object({
	passcode: v.pipe(
		v.string(),
		v.minLength(4, "Passcode must be at least 4 characters"),
	),
});

export const UPDATE_DECK_SCHEMA = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required")),
	description: v.string(),
	cards: v.pipe(
		v.array(UPDATE_CARD_SCHEMA),
		v.minLength(4, "At least 4 cards are required"),
	),
});

export const LANGUAGE_CODES = ["en", "vi"] as const;
