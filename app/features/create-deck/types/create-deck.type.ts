import type { Deck } from "~/features/deck";
import type { MediaInfo } from "~/shared/types";
import type { CreateCardSchema, CreateDeckSchema } from "~/valibot/schemas";

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
export type UploadCardImageResponse = Pick<MediaInfo, "fileId">;

export type CreateDeckCardFormState = CreateCardSchema & {
  tempId: string;
  fileId?: string;
  image?: File;
  isUploading: boolean;
  currentRequestId?: string;
};

export type CreateDeckFormState = Omit<CreateDeckSchema, "cards"> & {
  cards: CreateDeckCardFormState[];
};
