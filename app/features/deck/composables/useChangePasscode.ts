import type { FormSubmitEvent } from "@nuxt/ui";
import type { UpdateVisibilitySchema } from "~/valibot/schemas";
import { api } from "../api";
import { Visibility } from "../enums";
import { useDeckToasts } from "./useDeckToasts";

export function useChangePasscode() {
  const { token } = useAuth();
  const toast = useDeckToasts();
  const store = useDeckStore();

  const isUpdateVisibilityModalOpen = refManualReset(false);

  const updateVisibilityState = reactive<UpdateVisibilitySchema>({
    visibility: store.deck?.visibility || Visibility.PRIVATE,
    passcode: store.deck?.passcode,
  });

  const {
    status,
    pending: isChanging,
    execute: updateVisibility,
  } = api.updateVisibility({
    deckId: store.deckId,
    token,
    body: updateVisibilityState,
  });

  async function handleUpdateVisibilitySubmit(
    event: FormSubmitEvent<UpdateVisibilitySchema>,
  ) {
    Object.assign(updateVisibilityState, event.data);
    await updateVisibility();

    if (status.value === "success") {
      isChanging.value = false;
      await store.fetchDeck();
      toast.updateVisibilitySuccess();
    }

    if (status.value === "error") {
      toast.updateVisibilityFailed();
    }
  }

  return {
    isUpdateVisibilityModalOpen,
    isChanging,
    updateVisibilityState,
    handleUpdateVisibilitySubmit,
  };
}
