import { addDays, isAfter } from "date-fns";
import type { Card } from "~/features/card";
import type { LearnAnswerStatus } from "~/features/study";

export const updateCard = <T extends Pick<Card, "streak" | "reviewDate">>(
	card: T,
	status: LearnAnswerStatus,
) => {
	const { streak, reviewDate, ...rest } = card;
	const now = new Date();

	if (status === "incorrect") {
		return {
			...rest,
			streak: 0,
			reviewDate: now.toISOString(),
		};
	}

	const newStreak = streak + 1;

	const dayGap = 2 ** (newStreak - 1);

	const baseDate = reviewDate ? new Date(reviewDate) : now;

	const nextDate = addDays(baseDate, dayGap);

	const maxDate = addDays(now, 30);

	const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

	return {
		...rest,
		streak: newStreak,
		reviewDate: finalDate.toISOString(),
	};
};
