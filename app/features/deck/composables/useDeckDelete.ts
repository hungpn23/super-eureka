import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import { useDeckToasts } from "./useDeckToasts";

export function useDeckDelete() {
  const { token } = useAuth();
  const toast = useDeckToasts();
  const store = useDeckStore();

  const {
    data: res,
    pending: isDeleting,
    error,
    execute: deleteDeck,
  } = useFetch<SuccessResponse, ErrorResponse>(
    computed(() => `/api/decks/${store.deckId}`),
    {
      method: "DELETE",
      headers: { Authorization: token.value || "" },
      immediate: false,
      watch: false,
    },
  );

  async function handleDeleteDeck() {
    if (isDeleting.value) return;

    await deleteDeck();

    if (res.value?.success) {
      toast.deleteDeckSuccess();
      navigateTo("/library");
    }

    if (error.value) {
      toast.deleteDeckFailed();
    }
  }

  return {
    isDeleting,
    handleDeleteDeck,
  };
}
