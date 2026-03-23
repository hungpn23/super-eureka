import { acceptHMRUpdate, defineStore } from "pinia";
import { type GetDeckResponse, useDeckToasts } from "~/features/deck";
import type { ErrorResponse, SuccessResponse, UUID } from "~/shared/types";

export const useDeckStore = defineStore("deck", () => {
	const route = useRoute();
	const { token } = useAuth();
	const toast = useDeckToasts();
	const deckId = ref<UUID | null>(null);
	const slug = ref<string>("");

	const isFetchingDeck = computed(
		() => status.value === "idle" || status.value === "pending",
	);

	const {
		data: restartData,
		error: restartError,
		execute: restartDeck,
	} = useFetch<SuccessResponse, ErrorResponse>(
		computed(() => `/api/decks/restart/${deckId.value}`),
		{
			method: "POST",
			headers: { Authorization: token.value || "" },
			immediate: false,
			watch: false,
		},
	);

	const {
		data: deck,
		status,
		execute: fetchDeck,
	} = useFetch<GetDeckResponse, ErrorResponse>(
		computed(() => `/api/decks/${deckId.value}`),
		{
			method: "GET",
			headers: { Authorization: token.value || "" },
			server: false,
			immediate: false,
			watch: false,

			onResponseError: () => {
				showError({
					statusCode: 404,
					statusMessage: "Page Not Found",
				});
			},
		},
	);

	watchImmediate(
		() => route.name,
		async () => {
			if (route.name?.toString().includes("library-slug")) {
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

	return {
		deck,
		isFetchingDeck,
		deckId,
		slug,
		fetchDeck,
		handleRestartDeck,
	};
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
