import type { FormSubmitEvent } from "@nuxt/ui";
import type { UUID } from "~/shared/types";
import type { CloneDeckSchema } from "~/valibot/schemas";
import { api } from "../api";
import { Visibility } from "../enums";
import { useDeckToasts } from "./useDeckToasts";

export function useDeckClone(deckId: Ref<UUID | null>) {
  const toast = useDeckToasts();
  const { token } = useAuth();

  const isModalOpen = refManualReset(false);
  const state = reactive<CloneDeckSchema>({
    passcode: "",
  });

  const {
    execute,
    data,
    error,
    pending: isCloning,
  } = api.cloneDeck({ deckId, token, state });

  watch(error, () => {
    if (error.value) toast.cloneDeckFailed();
  });

  watch(data, () => {
    if (data.value?.success) {
      toast.cloneDeckSuccess();
      navigateTo("/library");
    }
  });

  async function addToLibrary(visibility: Visibility) {
    if (!token.value) {
      toast.guestAddDeckToLibrary();
      navigateTo("/login");
      return;
    }

    if (visibility === Visibility.PROTECTED) {
      state.passcode = "";
      isModalOpen.value = true;
      return;
    }

    await execute();
  }

  async function handleSubmit(event: FormSubmitEvent<CloneDeckSchema>) {
    state.passcode = event.data.passcode;
    isModalOpen.reset();
    await execute();
  }

  return {
    state,
    isModalOpen,
    isCloning,
    addToLibrary,
    handleSubmit,
  };
}
