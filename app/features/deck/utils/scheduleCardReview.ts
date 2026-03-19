import { addDays, isAfter } from "date-fns";
import type { Card } from "~/features/card";
import type { LearnAnswerStatus } from "~/features/study";

export const scheduleCardReview = <
  T extends Pick<Card, "streak" | "reviewDate">,
>(
  card: T,
  status: LearnAnswerStatus,
  hintUsedCount: number = 0,
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

  // penalty for using hints
  const hintPenalty = Math.min(hintUsedCount * 0.2, 0.8);
  const adjustedDayGap = Math.max(1, Math.floor(dayGap * (1 - hintPenalty)));

  const nextDate = addDays(now, adjustedDayGap);
  const maxDate = addDays(now, 30);
  const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

  return {
    ...rest,
    streak: newStreak,
    reviewDate: finalDate.toISOString(),
  };
};
