import type { UUID } from './branded';
import type { PaginationQuery } from './pagination';
import { cardSchema, type Card } from './card';
import type { User } from './user';
import * as v from 'valibot';
import type { Visibility } from '~/utils/enums';

export const deckSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  description: v.string(),
  cards: v.pipe(
    v.array(cardSchema),
    v.minLength(4, 'At least 4 cards are required'),
  ),
});

export type Deck = {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  visibility: Visibility;
  learnerCount: number;
  clonedFrom?: Deck | null;
  openedAt?: string;
  createdAt: string;
};

export type DeckStats = {
  total: number;
  known: number;
  learning: number;
  new: number;
};

export type DeckWithCards = Deck & {
  cards: Card[];
  stats: DeckStats;
};

export type DeckWithStats = Deck & {
  stats: DeckStats;
};

export type PublicDeck = Deck & {
  totalCards: number;
  owner: User;
};

export type UserStats = {
  currentStreak: number;
  longestStreak: number;
  totalCardsLearned: number;
  masteryRate: number;
};

export type DeckFormState = v.InferOutput<typeof deckSchema>;

export type DeckOrderBy = 'createdAt' | 'updatedAt' | 'openedAt' | 'name';

export type DeckPaginationQuery = PaginationQuery & {
  orderBy?: DeckOrderBy;
};

export type CreateDeckRes = Pick<Deck, 'id' | 'slug'>;

export type ContentSeparator = 'tab' | 'comma' | 'custom';

export type CardSeparator = 'new_line' | 'semicolon' | 'custom';

export type DeckUrlParams = {
  page: string;
  limit: string;
  search: string;
  filter: string;
};
