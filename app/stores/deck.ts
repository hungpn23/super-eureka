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
		data: restartData,
		error: restartError,
		execute: restartDeck,
	} = api.restartDeck({ deckId, token });

	const {
		data: deck,
		status,
		execute: fetchDeck,
	} = api.getDeck({ deckId, token });

	watchImmediate(
		() => route.name,
		async (routeName) => {
			const routeNameStr = routeName?.toString() || "";

			if (routeNameStr.includes("library-slug")) {
				deckId.value = route.query.deckId as UUID;
				slug.value = route.params.slug as string;

				await fetchDeck();
			}
		},
	);

	async function handleRestartDeck() {
		if (!deckId.value) return;

		await restartDeck();

		if (restartData.value?.success) {
			await fetchDeck();
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
		deck: computed(() => deck.value),
		isFetchingDeck: computed(
			() => status.value === "idle" || status.value === "pending",
		),
		isIgnoreDate: computed(() => isIgnoreDate.value),
		deckId,
		slug,
		fetchDeck,
		handleRestartDeck,
		handleCheckIgnoreDate,
		handleToggleIgnoreDate,
	};
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
