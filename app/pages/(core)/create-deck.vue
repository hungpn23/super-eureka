<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
	CreateDeckFormId,
	type CreateDeckResponse,
	createCard,
	getVisibilityLabel,
	useCreateDeckToasts,
} from "~/features/create-deck";
import CardsEditor from "~/features/create-deck/components/CardsEditor.vue";
import ImportCardsModal from "~/features/create-deck/components/ImportCardsModal.vue";
import VisibilityModal from "~/features/create-deck/components/VisibilityModal.vue";
import { Visibility } from "~/features/deck";
import type { ErrorResponse } from "~/shared/types";
import { getVisibilityIcon } from "~/shared/utils";
import {
	CREATE_DECK_SCHEMA,
	type CreateCardSchema,
	type CreateDeckSchema,
} from "~/valibot/schemas";

const toast = useCreateDeckToasts();
const { token } = useAuth();

const isVisibilityModalOpen = ref(false);
const isImportModalOpen = ref(false);
const formErrorMsg = ref("");
const createDeckFormKey = ref(0);

const createState = reactive<CreateDeckSchema>({
	name: "",
	visibility: Visibility.PUBLIC,
	cards: [createCard(), createCard(), createCard(), createCard()],
});

const {
	execute: createDeck,
	pending: isCreating,
	data: newDeck,
	error,
} = useFetch<CreateDeckResponse, ErrorResponse>("/api/decks", {
	method: "POST",
	headers: { Authorization: token.value || "" },
	body: createState,
	immediate: false,
	watch: false,
});

onMounted(() => {
	createDeckFormKey.value++;
});

async function handleCreateDeck(event: FormSubmitEvent<CreateDeckSchema>) {
	formErrorMsg.value = "";

	Object.assign(createState, event.data);
	await createDeck();

	const newDeckSlug = newDeck.value?.slug;
	const newDeckId = newDeck.value?.id;

	if (newDeckSlug && newDeckId) {
		navigateTo(`/library/${newDeckSlug}?deckId=${newDeckId}`);
		toast.createDeckSuccess();
	}

	if (error.value) {
		toast.createDeckFailed();
	}
}

async function onValidationError(event: FormErrorEvent) {
	const cardError = event.errors.find((e) => e.name === "input");

	formErrorMsg.value = cardError
		? cardError.message
		: "Please fill in all required fields.";
}

function handleImportCards(importCards: CreateCardSchema[]) {
	const currentCards = createState.cards.filter(
		(card) => card.term.trim().length > 0 || card.definition.trim().length > 0,
	);

	createState.cards = [...currentCards, ...importCards];
}
</script>

<template>
	<UContainer class="space-y-2">
		<UButton
			to="/library"
			class="px-0"
			variant="link"
			label="Library"
			icon="i-lucide-move-left"
			size="lg"
		/>

		<div class="space-y-2">
			<div class="flex place-content-between place-items-center gap-2">
				<h1 class="text-lg font-semibold text-nowrap sm:text-xl">
					Create a new deck
				</h1>

				<UButton
					:form="CreateDeckFormId.CREATE_DECK"
					:disabled="isCreating"
					class="cursor-pointer"
					icon="i-lucide-plus"
					label="Create"
					color="primary"
					type="submit"
				/>
			</div>

			<UAlert
				v-if="formErrorMsg"
				:description="formErrorMsg"
				icon="i-lucide-alert-triangle"
				color="error"
				variant="soft"
				title="Validation Error"
			/>
		</div>

		<!-- Create Deck Form -->
		<UForm
			:key="createDeckFormKey"
			:id="CreateDeckFormId.CREATE_DECK"
			:schema="CREATE_DECK_SCHEMA"
			:state="createState"
			class="mt-4 flex flex-col gap-2"
			autocomplete="off"
			@submit="handleCreateDeck"
			@error="onValidationError"
		>
			<UFormField label="Name" name="name" required>
				<UInput
					v-model="createState.name"
					:ui="{ base: 'sm:text-base' }"
					class="w-full"
					placeholder="Enter a name, like “Biology - Chapter 22: Evolution”"
				/>
			</UFormField>

			<UFormField label="Description" name="description">
				<UTextarea
					v-model="createState.description"
					:rows="1"
					:maxrows="5"
					:ui="{ base: 'sm:text-base' }"
					class="w-full"
					placeholder="Describe your deck (optional)"
					autoresize
				/>
			</UFormField>

			<UButton
				:label="getVisibilityLabel(createState.visibility)"
				:icon="getVisibilityIcon(createState.visibility)"
				class="cursor-pointe mt-1 w-fit"
				variant="outline"
				color="neutral"
				@click="isVisibilityModalOpen = true"
			/>

			<div class="mt-2 flex place-content-between place-items-center gap-4">
				<h2 class="font-medium sm:text-base">
					Cards ({{ createState.cards.length }})
				</h2>

				<UButton
					class="cursor-pointer"
					label="Import cards"
					icon="i-lucide-download"
					variant="soft"
					color="secondary"
					@click="isImportModalOpen = true"
				/>
			</div>

			<CardsEditor v-model:cards="createState.cards" />

			<VisibilityModal
				v-model:open="isVisibilityModalOpen"
				v-model:visibility="createState.visibility"
				v-model:passcode="createState.passcode"
			/>
		</UForm>

		<ImportCardsModal
			v-model:open="isImportModalOpen"
			@import="handleImportCards"
		/>
	</UContainer>
</template>
