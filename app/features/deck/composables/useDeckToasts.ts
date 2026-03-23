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
				title: "Failed to get decks.",
			});
		},
		getSharedDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to open this deck.",
			});
		},
		getDecksFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to load your library.",
			});
		},
		restartDeckSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Progress restarted.",
				description: "You can now start learning from scratch.",
			});
		},
		restartDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to restart progess.",
			});
		},
		deleteDeckSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Deck deleted successfully.",
				description: undefined,
			});
		},
		deleteDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to delete deck.",
			});
		},
		updateDeckSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Deck updated successfully.",
				description: undefined,
			});
		},
		updateDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to update deck.",
			});
		},
		updateVisibilitySuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Visibility updated successfully.",
				description: undefined,
			});
		},
		updateVisibilityFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to update visibility.",
			});
		},
	};
}
