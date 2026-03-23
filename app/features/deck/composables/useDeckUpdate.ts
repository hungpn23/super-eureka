import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import { type CardToSync, getCardStatus } from "~/features/card";
import { createCard } from "~/features/create-deck";
import type { ErrorResponse, SuccessResponse, UUID } from "~/shared/types";
import type { UpdateCardSchema, UpdateDeckSchema } from "~/valibot/schemas";
import { useDeckToasts } from "./useDeckToasts";

export function useDeckUpdate() {
	const { token } = useAuth();
	const toast = useDeckToasts();
	const store = useDeckStore();

	const isEditing = refManualReset(false);
	const updateFormErrorMessage = refManualReset("");

	const updateState = reactive<UpdateDeckSchema>({
		name: store.deck?.name || "",
		description: store.deck?.description,
		cards: store.deck?.cards.map((c) => structuredClone(c)) || [],
	});

	const {
		status,
		pending: isUpdating,
		execute: updateDeck,
	} = useFetch<SuccessResponse, ErrorResponse>(
		computed(() => `/api/decks/${store.deckId}`),
		{
			method: "PATCH",
			headers: { Authorization: token.value || "" },
			body: updateState,
			immediate: false,
			watch: false,
		},
	);

	watchImmediate(
		() => store.deck,
		() => resetUpdateState(),
	);

	function resetUpdateState() {
		Object.assign(updateState, store.deck);
		updateState.cards = store.deck?.cards.map((c) => structuredClone(c)) || [];
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
		resetUpdateState();
		isEditing.reset();
		updateFormErrorMessage.reset();
	}

	function handleUnshiftCard() {
		updateState.cards?.unshift(createStudyCard());
	}

	function handlePushCard() {
		updateState.cards?.push(createStudyCard());
	}

	function handleRemoveCard(cardId?: UUID) {
		updateState.cards = updateState.cards?.filter((c) => c.id !== cardId);
	}

	function createStudyCard(): UpdateCardSchema {
		return {
			...createCard(),
			id: crypto.randomUUID() as UUID,
			streak: 0,
			reviewDate: undefined,
			status: "new",
		};
	}

	function handleAddExample(index: number) {
		const card = updateState.cards?.[index];
		if (!card) return;

		if (!card.examples) {
			card.examples = [""];
			return;
		}

		card.examples.push("");
	}

	function handleRemoveExample(cardIndex: number, exampleIndex: number) {
		const card = updateState.cards?.[cardIndex];
		if (!card?.examples) return;

		card.examples = card.examples.filter((_, i) => i !== exampleIndex);
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
		handleAddExample,
		handleRemoveExample,
	};
}
