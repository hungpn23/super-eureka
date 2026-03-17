import type { UUID } from "~/shared/types";
import type { UpdateDeckSchema } from "~/valibot/schemas";

export type UpdateDeckOptions = {
  deckId: UUID | null;
  token: Ref<string | null>;
  body: UpdateDeckSchema;
};
