import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";
import type { ErrorResponse, UUID } from "~/shared/types";
import type { CloneDeckSchema } from "./types";

export function useDeckClone() {
	const router = useRouter();
	const toast = useToast();
	const { token } = useAuth();

	const isModalOpen = refManualReset(false);

	const state = reactive<CloneDeckSchema>({
		passcode: "",
	});

	async function cloneDeck(deckId: UUID) {
		await $fetch(`/api/decks/clone/${deckId}`, {
			method: "POST",
			headers: { Authorization: token.value || "" },
			body: state,
		})
			.then(() => {
				toast.add({ title: "Deck added to library", color: "success" });
				router.push("/library");
			})
			.catch((err: ErrorResponse) => {
				toast.add({
					title: err.data?.message || "Failed to add deck",
					color: "error",
				});
			});
	}

	return {
		isModalOpen,
		state,
		cloneDeck,
	};
}

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
	};
}
