import { Visibility } from '~/utils/enums.ts';
import type { UUID } from './branded';
import type { PaginationQuery } from './pagination';
import { CardSchema, type Card } from './card';
import * as v from 'valibot';

export const DeckWithCardsSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  description: v.string(),
  cards: v.pipe(
    v.array(CardSchema),
    v.minLength(4, 'At least 4 cards are required'),
  ),
});

export type DeckWithCards = v.InferOutput<typeof DeckWithCardsSchema>;

export type Deck = {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  visibility: Visibility;
  openedAt?: string;
};

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
