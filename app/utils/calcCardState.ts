import { addDays } from "date-fns";

type CalcResult = {
  correctCount: number;
  nextReviewDate: string;
};

export default (options: {
  correctCount: number;
  isCorrect: boolean;
  nextReviewDate?: string;
}): CalcResult => {
  const { nextReviewDate, correctCount, isCorrect } = options;
  const count = isCorrect ? correctCount + 1 : 0;
  const daysToAdd = count > 0 ? Math.min(Math.pow(2, count - 1), 365) : 0;

  if (!daysToAdd) {
    return {
      correctCount: 0,
      nextReviewDate: new Date().toISOString(),
    };
  }

  return {
    correctCount: count,
    nextReviewDate: addDays(
      nextReviewDate || Date.now(),
      daysToAdd,
    ).toISOString(),
  };
};
