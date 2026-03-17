import * as v from "valibot";
import type { UUID } from "~/shared/types";
import { CREATE_CARD_SCHEMA } from "../create-deck/constants";

export const CARD_STATUS = ["known", "learning", "new"] as const;

const STUDY_CARD_SCHEMA = v.object({
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

export const UPDATE_CARD_SCHEMA = v.intersect([
  CREATE_CARD_SCHEMA,
  STUDY_CARD_SCHEMA,
]);
