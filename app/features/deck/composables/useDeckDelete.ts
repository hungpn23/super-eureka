import { api } from "../api";
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
	} = api.deleteDeck({
		deckId: store.deckId,
		token,
	});

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
