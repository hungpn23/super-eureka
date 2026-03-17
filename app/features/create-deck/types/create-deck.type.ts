import type { Reactive } from "vue";
import type { Deck } from "~/features/deck";
import type { CreateDeckSchema } from "~/valibot/schemas";

export type CreateDeckOptions = {
  data: Reactive<CreateDeckSchema>;
  token: Ref<string | null>;
};

export type CreateDeckResponse = Pick<Deck, "id" | "slug">;
