import type { FetchError } from 'ofetch';

export type ErrorDetail = {
  property: string;
  constraintName: string;
  message: string;
};

export type ErrorResponse = FetchError<{
  timestamp: string;
  statusCode: number;
  message: string;
  details?: ErrorDetail[];
}>;
