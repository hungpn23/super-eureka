import type { ErrorResponse, UUID } from "~/shared/types";
import type { CloneDeckSchema } from "../types";

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
