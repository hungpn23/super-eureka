import type { Deck } from "~/features/deck";
import type { MediaInfo } from "~/shared/types";
import type { CreateCardSchema, CreateDeckSchema } from "~/valibot/schemas";

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
export type UploadCardImageResponse = Pick<MediaInfo, "url" | "fileId">;

export type CreateDeckCardFormState = CreateCardSchema & {
  clientId: string;
  fileId?: string;
  imageFile?: File;
  imageUrl?: string;
  isUploadingImage: boolean;
  imageUploadRequestId?: string;
};

export type CreateDeckFormState = Omit<CreateDeckSchema, "cards"> & {
  cards: CreateDeckCardFormState[];
};
