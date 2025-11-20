import type { CardStatus } from "~/utils/enums";
import type { UUID } from "./branded";

export type Card = {
  id: UUID;
  term: string;
  definition: string;
  correctCount: number;
  nextReviewDate?: string;
  status: CardStatus;
};

export type CreateCard = Pick<Card, "term" | "definition">;

export type UpdateCard = Pick<Card, "id" | "term" | "definition">;

export type CardAnswer = Pick<Card, "id" | "correctCount" | "nextReviewDate">;

export type CalcResult = {
  correctCount: number;
  nextReviewDate: string;
};
