import { addDays, isAfter } from "date-fns";
import type { Card, LearnQuestion } from "~/features/card";

export const updateCard = <T extends Card | LearnQuestion>(
	q: T,
	isCorrect: boolean,
) => {
	const { streak, reviewDate, ...rest } = q;
	const now = new Date();

	if (!isCorrect) {
		return {
			...rest,
			streak: 0,
			reviewDate: now.toISOString(),
		};
	}

	const newStreak = streak + 1;

	const gap = 2 ** (newStreak - 1);

	const baseDate = reviewDate ? new Date(reviewDate) : now;

	const nextDate = addDays(baseDate, gap);

	const maxDate = addDays(now, 30);

	const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

	return {
		...rest,
		streak: newStreak,
		reviewDate: finalDate.toISOString(),
	};
};
