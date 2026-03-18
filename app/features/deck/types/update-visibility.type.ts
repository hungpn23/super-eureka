import type { UUID } from "~/shared/types";
import type { UpdateVisibilitySchema } from "~/valibot/schemas";

export type UpdateVisibilityOptions = {
  deckId: UUID | null;
  token: Ref<string | null>;
  body: UpdateVisibilitySchema;
};
