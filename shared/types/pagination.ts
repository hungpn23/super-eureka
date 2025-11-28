import type { QueryOrder } from '~/utils/enums.ts';
import type { Query } from '.';

export type PaginationQuery = Query & {
  page?: string;
  limit?: string;
  order?: QueryOrder;
  search?: string;
};

export type Metadata = {
  limit: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  nextPage: number;
  previousPage: number;
};

export type Paginated<T> = {
  data: T[];
  metadata: Metadata;
};
