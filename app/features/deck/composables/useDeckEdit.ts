import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { CardToSync } from "~/features/card";
import type { ErrorResponse, UUID } from "~/shared/types";
import type { GetDeckResponse, UpdateDeckSchema } from "../types";
import { getCardStatus } from "../utils/common.util";

export function useDeckEdit() {
	const { token } = useAuth();
	const toast = useToast();
	const store = useDeckStore();

	const formErrorMsg = ref("");
	const isEditing = ref(false);
	const isSavingChanges = ref(false);

	const updateState = reactive<Partial<UpdateDeckSchema>>({});

	function resetFormState(deck?: GetDeckResponse) {
		if (deck) {
			updateState.name = deck.name;
			updateState.description = deck.description || "";
			updateState.cards = structuredClone(deck.cards);
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

		if (updateState.cards?.length) {
			for (const c of updateState.cards) {
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

	function handleStartEditing() {
		isEditing.value = true;
	}

	function handleCancelEditing() {
		resetFormState(store.deck);
		isEditing.value = false;
		formErrorMsg.value = "";

		toast.add({
			title: "Editing canceled successfully.",
			color: "success",
		});
	}

	function addCardFirst() {
		updateState.cards?.unshift({
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
		updateState.cards?.push({
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
		updateState.cards = updateState.cards?.filter((c) => c.id !== cardId);
	}

	return {
		// Refs
		formErrorMsg,
		isEditing,
		isSavingChanges,
		updateState,

		// Functions
		syncSavedCards,
		onSubmit,
		onSubmitError,
		handleStartEditing,
		handleCancelEditing,
		addCardFirst,
		addCardLast,
		removeCard,
	};
}
