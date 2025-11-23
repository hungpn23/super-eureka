import { CardStatus } from '~/utils/enums';
import { QuestionType, QuestionDirection } from '~/utils/enums/question';
import type { UUID } from './branded';
import * as v from 'valibot';

export const CardSchema = v.object({
  id: v.pipe(
    v.string(),
    v.transform((val) => val as UUID),
  ),
  term: v.pipe(v.string(), v.minLength(1, 'Term is required')),
  definition: v.pipe(v.string(), v.minLength(1, 'Definition is required')),
  streak: v.pipe(v.number(), v.minValue(0, 'Streak cannot be negative')),
  reviewDate: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, 'Review date is required'),
      v.transform((val) => new Date(val).toISOString()),
    ),
  ),
  status: v.enum(CardStatus),
});

export type Card = v.InferOutput<typeof CardSchema>;

export type CardAnswer = Pick<Card, 'id' | 'streak' | 'reviewDate'>;

export type CalcResult = Required<Pick<Card, 'streak' | 'reviewDate'>>;

export type Question = {
  id: string;
  type: QuestionType;
  direction: QuestionDirection;
  question: string;
  answer: string;
  choices?: string[];
};
