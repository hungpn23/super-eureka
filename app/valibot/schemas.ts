import * as v from "valibot";
import { CARD_STATUS } from "~/features/card/constants";
import { LANGUAGE_CODES, Visibility } from "~/features/deck/enums";
import type { UUID } from "~/shared/types";

export const AUTH_SCHEMA = v.object({
  username: v.message(
    v.pipe(v.string(), v.minLength(1)),
    "Username is required.",
  ),
  email: v.message(
    v.pipe(v.string(), v.email()),
    "Please enter a valid email address.",
  ),
  otp: v.pipe(v.array(v.string()), v.minLength(6, "Please enter a valid OTP.")),
  password: v.message(
    v.pipe(
      v.string(),
      v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
    ),
    "Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.",
  ),
  confirmPassword: v.pipe(v.string()),
});

export const CLONE_DECK_SCHEMA = v.object({
  passcode: v.pipe(
    v.string(),
    v.minLength(4, "Passcode must be at least 4 characters"),
  ),
});

export const CREATE_CARD_SCHEMA = v.object({
  term: v.pipe(v.string(), v.nonEmpty("Term is required")),
  termLanguage: v.picklist(LANGUAGE_CODES),
  definition: v.pipe(v.string(), v.nonEmpty("Definition is required")),
  definitionLanguage: v.picklist(LANGUAGE_CODES),
  pronunciation: v.nullish(v.string()),
  partOfSpeech: v.nullish(v.string()),
  usageOrGrammar: v.nullish(v.string()),
  examples: v.nullish(
    v.array(v.pipe(v.string(), v.nonEmpty("Example cannot be empty"))),
  ),
});

export const UPDATE_CARD_SCHEMA = v.object({
  ...CREATE_CARD_SCHEMA.entries,
  id: v.pipe(
    v.string(),
    v.uuid("Card id must be a valid UUID"),
    v.transform((val) => val as UUID),
  ),
  streak: v.pipe(v.number(), v.minValue(0, "Streak cannot be negative")),
  reviewDate: v.nullish(
    v.pipe(
      v.string(),
      v.nonEmpty("Review date is required"),
      v.transform((val) => new Date(val).toISOString()),
    ),
  ),
  status: v.picklist(CARD_STATUS),
});

export const CREATE_DECK_SCHEMA = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
  description: v.nullish(v.string()),
  visibility: v.enum(Visibility),
  passcode: v.nullish(
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

export const UPDATE_DECK_SCHEMA = v.object({
  ...v.pick(CREATE_DECK_SCHEMA, ["name", "description"]).entries,
  cards: v.pipe(
    v.array(UPDATE_CARD_SCHEMA),
    v.minLength(4, "At least 4 cards are required"),
  ),
});

export const UPDATE_VISIBILITY_SCHEMA = v.object({
  ...v.pick(CREATE_DECK_SCHEMA, ["visibility", "passcode"]).entries,
});

export const IMPORT_CARD_SCHEMA = v.object({
  input: v.pipe(v.string(), v.nonEmpty("Input is required")),
});

export type CloneDeckSchema = v.InferOutput<typeof CLONE_DECK_SCHEMA>;
export type CreateCardSchema = v.InferOutput<typeof CREATE_CARD_SCHEMA>;
export type UpdateCardSchema = v.InferOutput<typeof UPDATE_CARD_SCHEMA>;
export type CreateDeckSchema = v.InferOutput<typeof CREATE_DECK_SCHEMA>;
export type UpdateDeckSchema = v.InferOutput<typeof UPDATE_DECK_SCHEMA>;
export type UpdateVisibilitySchema = v.InferOutput<
  typeof UPDATE_VISIBILITY_SCHEMA
>;
export type ImportCardsSchema = v.InferOutput<typeof IMPORT_CARD_SCHEMA>;
