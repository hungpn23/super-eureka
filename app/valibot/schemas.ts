import * as v from "valibot";
import { CARD_STATUS } from "~/features/card/constants";
import { LANGUAGE_CODES, Visibility } from "~/features/deck/enums";
import { AVATAR } from "~/features/user";
import type { UUID } from "~/shared/types";

export const AUTH_SCHEMA = v.object({
  username: v.message(
    v.pipe(v.string(), v.nonEmpty()),
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

export const CREATE_DECK_CARD_SCHEMA = v.object({
  ...CREATE_CARD_SCHEMA.entries,
  fileId: v.optional(v.pipe(v.string(), v.nonEmpty("Card image is invalid"))),
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
    v.array(CREATE_DECK_CARD_SCHEMA),
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

export const UPLOAD_AVATAR_SCHEMA = v.object({
  avatar: v.pipe(
    v.instance(File, "Please select an image file."),
    v.check(
      (f) => AVATAR.ACCEPTED_TYPES.includes(f.type),
      "Only JPG, PNG, GIF or WebP are allowed.",
    ),
    v.check((f) => f.size <= AVATAR.MAX_FILE_SIZE, "Image must be under 2MB."),
  ),
});

export const UPDATE_PROFILE_SCHEMA = v.object({
  username: AUTH_SCHEMA.entries.username, // tái sử dụng trực tiếp
});

export const CHANGE_PASSWORD_SCHEMA = v.pipe(
  v.object({
    oldPassword: AUTH_SCHEMA.entries.password, // tái sử dụng logic validate password
    newPassword: AUTH_SCHEMA.entries.password,
    confirmPassword: AUTH_SCHEMA.entries.confirmPassword,
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      "Passwords do not match",
    ),
    ["confirmPassword"],
  ),
);

export type CloneDeckSchema = v.InferOutput<typeof CLONE_DECK_SCHEMA>;
export type CreateCardSchema = v.InferOutput<typeof CREATE_CARD_SCHEMA>;
export type CreateDeckCardSchema = v.InferOutput<
  typeof CREATE_DECK_CARD_SCHEMA
>;
export type UpdateCardSchema = v.InferOutput<typeof UPDATE_CARD_SCHEMA>;
export type CreateDeckSchema = v.InferOutput<typeof CREATE_DECK_SCHEMA>;
export type UpdateDeckSchema = v.InferOutput<typeof UPDATE_DECK_SCHEMA>;
export type UpdateVisibilitySchema = v.InferOutput<
  typeof UPDATE_VISIBILITY_SCHEMA
>;
export type ImportCardsSchema = v.InferOutput<typeof IMPORT_CARD_SCHEMA>;
export type UploadAvatarSchema = v.InferOutput<typeof UPLOAD_AVATAR_SCHEMA>;
export type UpdateProfileSchema = v.InferOutput<typeof UPDATE_PROFILE_SCHEMA>;
export type ChangePasswordSchema = v.InferOutput<typeof CHANGE_PASSWORD_SCHEMA>;
