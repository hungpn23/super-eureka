import type { Reactive } from "vue";
import type { UUID } from "~/shared/types";
import type { CloneDeckSchema } from "~/valibot/schemas";

export type CloneDeckOptions = {
  deckId: Ref<UUID | null>;
  token: Ref<string | null>;
  state: Reactive<CloneDeckSchema>;
};
