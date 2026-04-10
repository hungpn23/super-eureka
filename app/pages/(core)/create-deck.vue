<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
	buildCreateDeckPayload,
	CreateDeckFormId,
	type CreateDeckFormState,
	type CreateDeckResponse,
	createDeckCardFormState,
	getVisibilityLabel,
	type UploadCardImageResponse,
	useCreateDeckToasts,
} from "~/features/create-deck";
import CardsEditor from "~/features/create-deck/components/CardsEditor.vue";
import ImportCardsModal from "~/features/create-deck/components/ImportCardsModal.vue";
import VisibilityModal from "~/features/create-deck/components/VisibilityModal.vue";
import { Visibility } from "~/features/deck";
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
const isCreating = ref(false);

const createState = reactive<CreateDeckFormState>({
	name: "",
	visibility: Visibility.PUBLIC,
	cards: [
		createDeckCardFormState(),
		createDeckCardFormState(),
		createDeckCardFormState(),
		createDeckCardFormState(),
	],
});

const isUploadingCardImage = computed(() =>
	createState.cards.some((card) => card.isUploading),
);

onMounted(() => {
	createDeckFormKey.value++;
});

async function handleCreateDeck(_event: FormSubmitEvent<CreateDeckSchema>) {
	if (isUploadingCardImage.value) {
		formErrorMsg.value = "Please wait until all card images finish uploading.";
		return;
	}

	formErrorMsg.value = "";
	isCreating.value = true;

	try {
		const payload = buildCreateDeckPayload(createState);
		const newDeck = await $fetch<CreateDeckResponse>("/api/decks", {
			method: "POST",
			headers: { Authorization: token.value || "" },
			body: payload,
		});

		if (newDeck.slug && newDeck.id) {
			navigateTo(`/library/${newDeck.slug}?deckId=${newDeck.id}`);
		}

		toast.createDeckSuccess();
	} catch {
		toast.createDeckFailed();
	} finally {
		isCreating.value = false;
	}
}

async function onValidationError(event: FormErrorEvent) {
	formErrorMsg.value =
		event.errors[0]?.message || "Please fill in all required fields.";
}

function handleImportCards(importCards: CreateCardSchema[]) {
	const currentCards = createState.cards.filter(
		(card) => card.term.trim().length > 0 || card.definition.trim().length > 0,
	);

	createState.cards = [
		...currentCards,
		...importCards.map((card) => createDeckCardFormState(card)),
	];
}

function getCardById(cardId: string) {
	return createState.cards.find((card) => card.tempId === cardId);
}

function getCurrentUploadingCard(cardId: string, requestId: string) {
	const card = getCardById(cardId);
	if (!card || card.currentRequestId !== requestId) return null;
	return card;
}

function resetCardImage(cardId: string) {
	const card = getCardById(cardId);
	if (!card) return;

	card.fileId = undefined;
	card.image = undefined;
	card.isUploading = false;
	card.currentRequestId = crypto.randomUUID();
}

async function handleUpdateCardImage(payload: {
	tempId: string;
	file?: File | null;
}) {
	if (!payload.file) return resetCardImage(payload.tempId);

	const card = getCardById(payload.tempId);
	if (!card) return;

	const requestId = crypto.randomUUID();
	const formData = new FormData();

	formData.append("card-image", payload.file);
	card.fileId = undefined;
	card.image = payload.file;
	card.isUploading = true;
	card.currentRequestId = requestId;

	try {
		const response = await $fetch<UploadCardImageResponse>(
			"/api/decks/card-image",
			{
				method: "POST",
				headers: { Authorization: token.value || "" },
				body: formData,
			},
		);

		const currentCard = getCurrentUploadingCard(payload.tempId, requestId);
		if (!currentCard) return;

		currentCard.fileId = response.fileId;
	} catch {
		const currentCard = getCurrentUploadingCard(payload.tempId, requestId);
		if (!currentCard) return;

		currentCard.fileId = undefined;

		toast.uploadCardImageFailed();
	} finally {
		const currentCard = getCurrentUploadingCard(payload.tempId, requestId);

		if (currentCard) {
			currentCard.isUploading = false;
			currentCard.currentRequestId = undefined;
		}
	}
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
					:disabled="isCreating || isUploadingCardImage"
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

			<CardsEditor
				v-model:cards="createState.cards"
				@update:card-image="handleUpdateCardImage"
			/>

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
