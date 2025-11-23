export enum UserRole {
  USER,
  ADMIN,
}

export enum Visibility {
  PUBLIC = 'Everyone',
  PROTECTED = 'People with a passcode',
  PRIVATE = 'Just me',
}

// https://github.com/mikro-orm/mikro-orm/blob/master/packages/core/src/enums.ts#L73
export enum QueryOrder {
  ASC = 'ASC',
  ASC_NULLS_LAST = 'ASC NULLS LAST',
  ASC_NULLS_FIRST = 'ASC NULLS FIRST',
  DESC = 'DESC',
  DESC_NULLS_LAST = 'DESC NULLS LAST',
  DESC_NULLS_FIRST = 'DESC NULLS FIRST',
  asc = 'asc',
  asc_nulls_last = 'asc nulls last',
  asc_nulls_first = 'asc nulls first',
  desc = 'desc',
  desc_nulls_last = 'desc nulls last',
  desc_nulls_first = 'desc nulls first',
}

export enum DeckOrderBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  OPENED_AT = 'openedAt',
  NAME = 'name',
}

export enum CardStatus {
  KNOWN = 'known',
  LEARNING = 'learning',
  NEW = 'new',
}
