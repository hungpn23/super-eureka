import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { CardToSync } from "~/features/card";
import type { UUID } from "~/shared/types";
import { api } from "../api";
import type { GetDeckResponse, UpdateDeckSchema } from "../types";
import { getCardStatus } from "../utils/common.util";
import { useDeckToasts } from "./useDeckToasts";

export function useDeckUpdate() {
	const { token } = useAuth();
	const toast = useDeckToasts();
	const store = useDeckStore();

	const isEditing = refManualReset(false);
	const updateFormErrorMessage = refManualReset("");

	const updateState = reactive<Partial<UpdateDeckSchema>>({});

	const {
		status,
		pending: isUpdating,
		execute: updateDeck,
	} = api.updateDeck({
		deckId: store.deckId,
		token,
		body: updateState,
	});

	watchImmediate(
		() => store.deck,
		(newDeck) => resetFormState(newDeck),
	);

	function resetFormState(deck?: GetDeckResponse) {
		if (!deck) return;

		updateState.name = deck.name;
		updateState.description = deck.description || "";
		updateState.cards = structuredClone(deck.cards);
	}

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

	async function handleUpdateSubmit(event: FormSubmitEvent<UpdateDeckSchema>) {
		Object.assign(updateState, event.data);
		await updateDeck();

		if (status.value === "success") {
			isEditing.reset();
			await store.fetchDeck();
			toast.updateDeckSuccess();
		}

		if (status.value === "error") {
			toast.updateDeckFailed();
		}

		updateFormErrorMessage.reset();
	}

	async function handleUpdateError(event: FormErrorEvent) {
		const formError = event.errors.find((e) => e.name === "");

		updateFormErrorMessage.value = formError
			? formError.message
			: "Please fill in all required fields.";
	}

	function handleStartEditing() {
		isEditing.value = true;
	}

	function handleCancelEditing() {
		resetFormState(store.deck);
		isEditing.reset();
		updateFormErrorMessage.reset();
	}

	function handleUnshiftCard() {
		updateState.cards?.unshift({
			id: crypto.randomUUID() as UUID,
			term: "",
			definition: "",
			streak: 0,
			reviewDate: undefined,
			status: "new",
		});
	}

	function handlePushCard() {
		updateState.cards?.push({
			id: crypto.randomUUID() as UUID,
			term: "",
			definition: "",
			streak: 0,
			reviewDate: undefined,
			status: "new",
		});
	}

	function handleRemoveCard(cardId?: UUID) {
		updateState.cards = updateState.cards?.filter((c) => c.id !== cardId);
	}

	return {
		updateFormErrorMessage,
		isEditing,
		isUpdating,
		updateState,
		syncSavedCards,
		handleUpdateSubmit,
		handleUpdateError,
		handleStartEditing,
		handleCancelEditing,
		handleUnshiftCard,
		handlePushCard,
		handleRemoveCard,
	};
}
