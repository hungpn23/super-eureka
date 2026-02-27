import * as v from "valibot";
import type { UUID } from "~/shared/types";

export const UPDATE_CARD_SCHEMA = v.object({
	id: v.pipe(
		v.string(),
		v.transform((val) => val as UUID),
	),
	term: v.pipe(v.string(), v.minLength(1, "Term is required")),
	definition: v.pipe(v.string(), v.minLength(1, "Definition is required")),
	streak: v.pipe(v.number(), v.minValue(0, "Streak cannot be negative")),
	reviewDate: v.nullish(
		v.pipe(
			v.string(),
			v.minLength(1, "Review date is required"),
			v.transform((val) => new Date(val).toISOString()),
		),
	),
	status: v.picklist(["known", "learning", "new"] as const),
});
