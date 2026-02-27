import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";

export function useDeckToasts() {
	const toast = useToast();

	return {
		cloneDeckSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Deck added to library.",
				description: "You can now access the deck in your library.",
			});
		},
		cloneDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to clone deck.",
			});
		},
		guestAddDeckToLibrary: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Please login first before adding deck to library.",
				description: undefined,
			});
		},
		getSharedDecksFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to get shared decks.",
			});
		},
	};
}
