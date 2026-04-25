<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
	buildCreateCardState,
	buildCreateDeckBody,
	type CreateCardState,
	CreateDeckFormId,
	type CreateDeckResponse,
	type CreateDeckState,
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
	type CreateCardBody,
	type CreateDeckBody,
} from "~/valibot/schemas";

const toast = useCreateDeckToasts();
const { token } = useAuth();

const isVisibilityModalOpen = ref(false);
const isImportModalOpen = ref(false);
const formErrorMsg = ref("");
const createDeckFormKey = ref(0);
const isCreating = ref(false);

const createState = reactive<CreateDeckState>({
	name: "",
	visibility: Visibility.PUBLIC,
	cards: [
		buildCreateCardState(),
		buildCreateCardState(),
		buildCreateCardState(),
		buildCreateCardState(),
	],
});

const isUploadingCardImage = computed(() =>
	createState.cards.some((card) => card.isUploading),
);

onMounted(() => {
	createDeckFormKey.value++;
});

async function handleCreateDeck(_event: FormSubmitEvent<CreateDeckBody>) {
	if (isUploadingCardImage.value) {
		formErrorMsg.value = "Please wait until all card images finish uploading.";
		return;
	}

	formErrorMsg.value = "";
	isCreating.value = true;

	try {
		const newDeck = await $fetch<CreateDeckResponse>("/api/decks", {
			method: "POST",
			headers: { Authorization: token.value || "" },
			body: buildCreateDeckBody(createState),
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

function handleImportCards(importCards: CreateCardBody[]) {
	const currentCards = createState.cards.filter(
		(card) => card.term.trim().length > 0 || card.definition.trim().length > 0,
	);

	createState.cards = [
		...currentCards,
		...importCards.map((card) => buildCreateCardState(card)),
	];
}

function resetCardImage(card: CreateCardState) {
	card.fileId = undefined;
	card.image = undefined;
	card.isUploading = false;
	card.currentRequestId = crypto.randomUUID();
}

async function handleUpdateCardImage(payload: {
	tempId: string;
	file?: File | null;
}) {
	const card = createState.cards.find(
		({ tempId }) => tempId === payload.tempId,
	);
	if (!card) return;

	if (!payload.file) return resetCardImage(card);

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

		if (card.currentRequestId !== requestId) return;
		card.fileId = response.fileId;
	} catch {
		if (card.currentRequestId !== requestId) return;
		card.fileId = undefined;

		toast.uploadCardImageFailed();
	} finally {
		if (card.currentRequestId === requestId) {
			card.isUploading = false;
			card.currentRequestId = undefined;
		}
	}
}
</script>

<template>
	<UContainer>
		<UPageHeader
			:ui="{
				title: 'text-lg sm:text-xl font-medium',
				container: 'space-y-3',
			}"
			class="my-4 border-0 py-0"
		>
			<template #headline>
				<UButton
					to="/library"
					class="px-0"
					variant="link"
					label="Library"
					icon="i-lucide-move-left"
					size="lg"
				/>
			</template>

			<template #title>Create a new deck</template>

			<template #links>
				<UButton
					:form="CreateDeckFormId.CREATE_DECK"
					:disabled="isCreating || isUploadingCardImage"
					:loading="isCreating"
					class="cursor-pointer transition-all hover:scale-102 active:scale-95"
					icon="i-lucide-plus"
					loading-icon="i-lucide-loader-circle"
					label="Create"
					color="primary"
					type="submit"
				/>
			</template>
		</UPageHeader>

		<UPageBody class="mt-2 space-y-6 sm:mt-4">
			<UAlert
				v-if="formErrorMsg"
				:description="formErrorMsg"
				icon="i-lucide-alert-triangle"
				color="error"
				variant="soft"
				title="Validation Error"
			/>

			<UForm
				:key="createDeckFormKey"
				:id="CreateDeckFormId.CREATE_DECK"
				:schema="CREATE_DECK_SCHEMA"
				:state="createState"
				class="flex flex-col gap-6"
				autocomplete="off"
				@submit="handleCreateDeck"
				@error="onValidationError"
			>
				<UCard
					:ui="{ body: 'space-y-4 p-4 sm:p-6' }"
					variant="outline"
					class="transition-all"
				>
					<UFormField label="Name" name="name" required>
						<UInput
							v-model="createState.name"
							:ui="{ base: 'sm:text-base' }"
							class="w-full"
							placeholder='Enter a name, like "Biology - Chapter 22: Evolution"'
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

					<USeparator />

					<div class="flex place-items-center gap-2">
						<UIcon name="i-lucide-eye" class="text-muted size-4" />
						<span class="text-muted text-sm">Visible to:</span>
						<UButton
							:label="getVisibilityLabel(createState.visibility)"
							:icon="getVisibilityIcon(createState.visibility)"
							class="cursor-pointer transition-all hover:scale-102 active:scale-95"
							variant="soft"
							color="neutral"
							size="sm"
							@click="isVisibilityModalOpen = true"
						/>
					</div>
				</UCard>

				<div class="flex place-content-between place-items-center gap-4">
					<div class="flex place-items-center gap-2">
						<h2 class="text-lg font-medium sm:text-xl">Cards</h2>
						<UBadge
							:label="createState.cards.length"
							variant="subtle"
							color="neutral"
							class="rounded-full px-2"
						/>
					</div>

					<UButton
						class="cursor-pointer transition-all hover:scale-102 active:scale-95"
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
		</UPageBody>
	</UContainer>
</template>
