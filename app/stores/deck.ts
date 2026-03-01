import { acceptHMRUpdate, defineStore } from "pinia";
import { api, useDeckToasts } from "~/features/deck";
import type { UUID } from "~/shared/types";

export const useDeckStore = defineStore("deck", () => {
	const route = useRoute();
	const { token } = useAuth();
	const toast = useDeckToasts();
	const isIgnoreDate = ref(false);
	const deckId = ref<UUID | null>(null);
	const slug = ref<string>("");

	const {
		execute: restartDeck,
		data: restartData,
		error: restartError,
	} = api.restartDeck({ deckId, token });

	const {
		data: deck,
		status,
		refresh: refetchDeckDetail,
		execute: getDeckDetail,
	} = api.getDeckDetail({ deckId, token });

	watchImmediate(
		() => route.name,
		async (routeName) => {
			const routeNameStr = routeName?.toString() || "";

			if (routeNameStr.includes("library-slug")) {
				deckId.value = route.query.deckId as UUID;
				slug.value = route.params.slug as string;

				await getDeckDetail();
			}
		},
	);

	async function handleRestartDeck() {
		if (!deckId.value) return;

		await restartDeck();

		if (restartData.value?.success) {
			await refetchDeckDetail();
			toast.restartDeckSuccess();
		}

		if (restartError.value) toast.restartDeckFailed();
	}

	function handleCheckIgnoreDate(checked: boolean) {
		isIgnoreDate.value = checked;
	}

	function handleToggleIgnoreDate() {
		isIgnoreDate.value = !isIgnoreDate.value;
	}

	return {
		// State
		deck: computed(() => deck.value),
		isFetchingDeck: computed(
			() => status.value === "idle" || status.value === "pending",
		),
		isIgnoreDate: computed(() => isIgnoreDate.value),

		// Getters
		deckId,
		slug,

		// Actions
		refetchDeckDetail,
		handleRestartDeck,
		handleCheckIgnoreDate,
		handleToggleIgnoreDate,
	};
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
