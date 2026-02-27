import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";

export function useCreateDeckToasts() {
	const toast = useToast();

	return {
		createDeckSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Deck created successfully.",
				description: "You can now access the deck in your library.",
			});
		},
		createDeckFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to create deck.",
			});
		},
	};
}
