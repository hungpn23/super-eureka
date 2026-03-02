import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { CardToSync } from "~/features/card";
import type { ErrorResponse, UUID } from "~/shared/types";
import type { GetDeckResponse, UpdateDeckSchema } from "../types";
import { getCardStatus } from "../utils/common.util";

export function useDeckEdit() {
	const toast = useToast();
	const { token } = useAuth();
	const store = useDeckStore();

	const formErrorMsg = ref("");
	const isEditing = ref(false);
	const isSavingChanges = ref(false);

	const state = reactive<Partial<UpdateDeckSchema>>({});

	function resetFormState(deck?: GetDeckResponse) {
		if (deck) {
			state.name = deck.name;
			state.description = deck.description || "";
			state.cards = structuredClone(deck.cards);
		}
	}

	// Sync form state when deck changes
	watchImmediate(
		() => store.deck,
		(newDeck) => resetFormState(newDeck),
	);

	// Update form state when auto-save happens
	function syncSavedCards(cards: CardToSync[]) {
		if (!cards.length) return;

		const map = new Map(cards.map((a) => [a.id, a]));

		if (state.cards?.length) {
			for (const c of state.cards) {
				const answer = map.get(c.id);

				if (answer) {
					Object.assign(c, {
						...answer,
						status: getCardStatus(answer.reviewDate),
					});
				}
			}
		}
	}

	async function onSubmit(event: FormSubmitEvent<UpdateDeckSchema>) {
		if (isSavingChanges.value) return;
		isSavingChanges.value = true;

		$fetch(`/api/decks/${store.deckId}`, {
			method: "PATCH",
			headers: { Authorization: token.value || "" },
			body: event.data,
		})
			.then(async () => {
				isEditing.value = false;
				await store.fetchDeck();

				toast.add({
					title: "Changes saved successfully.",
					color: "success",
				});
			})
			.catch((error: ErrorResponse) => {
				toast.add({
					title: "Error saving changes",
					description: JSON.stringify(error.data?.message || "Unknown error"),
					color: "error",
				});

				return;
			})
			.finally(() => {
				formErrorMsg.value = "";
				isSavingChanges.value = false;
			});
	}

	async function onSubmitError(event: FormErrorEvent) {
		const formError = event.errors.find((e) => e.name === "");

		formErrorMsg.value = formError
			? formError.message
			: "Please fill in all required fields.";
	}

	function startEditing() {
		isEditing.value = true;
	}

	function cancelEditing() {
		resetFormState(store.deck);
		isEditing.value = false;
		formErrorMsg.value = "";

		toast.add({
			title: "Editing canceled successfully.",
			color: "success",
		});
	}

	function addCardFirst() {
		state.cards?.unshift({
			id: crypto.randomUUID() as UUID,
			term: "",
			definition: "",
			streak: 0,
			reviewDate: undefined,
			status: "new",
		});

		toast.add({
			title: "Added first successfully.",
			color: "success",
		});
	}

	function addCardLast() {
		state.cards?.push({
			id: crypto.randomUUID() as UUID,
			term: "",
			definition: "",
			streak: 0,
			reviewDate: undefined,
			status: "new",
		});

		toast.add({
			title: "Added last successfully.",
			color: "success",
		});
	}

	function removeCard(cardId?: UUID) {
		state.cards = state.cards?.filter((c) => c.id !== cardId);
	}

	return {
		// Refs
		formErrorMsg,
		isEditing,
		isSavingChanges,
		state,

		// Functions
		syncSavedCards,
		onSubmit,
		onSubmitError,
		startEditing,
		cancelEditing,
		addCardFirst,
		addCardLast,
		removeCard,
	};
}
