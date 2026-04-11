import type { Deck } from "~/features/deck";
import type { MediaInfo } from "~/shared/types";
import type { CreateCardBody, CreateDeckBody } from "~/valibot/schemas";

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
export type UploadCardImageResponse = Pick<MediaInfo, "fileId">;

export type CardImageState = {
  tempId: string;
  fileId?: string;
  image?: File;
  isUploading: boolean;
  currentRequestId?: string;
};

export type CreateCardState = CreateCardBody & CardImageState;

export type CreateDeckState = Omit<CreateDeckBody, "cards"> & {
  cards: CreateCardState[];
};
