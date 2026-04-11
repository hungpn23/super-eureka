<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import type { CardSeparator, ContentSeparator } from "~/features/create-deck";
import {
	CARD_SEPARATOR_ITEMS,
	CONTENT_SEPARATOR_ITEMS,
	CreateDeckFormId,
	getCardSeparator,
	getContentSeparator,
	useCreateDeckToasts,
} from "~/features/create-deck";
import {
	CREATE_CARD_SCHEMA,
	type CreateCardBody,
	IMPORT_CARD_SCHEMA,
	type ImportCardsSchema,
} from "~/valibot/schemas";

type ParsedImportCard = Pick<CreateCardBody, "term" | "definition">;

const props = defineProps<{
	open: boolean;
}>();

const emit = defineEmits<{
	(event: "update:open", value: boolean): void;
	(event: "import", cards: CreateCardBody[]): void;
}>();

const toast = useCreateDeckToasts();

const importState = reactive({
	input: "",
	contentSeparator: "tab" as ContentSeparator,
	cardSeparator: "new_line" as CardSeparator,
	customContentSeparator: "-",
	customCardSeparator: "\\",
});

const isOpen = computed({
	get: () => props.open,
	set: (value: boolean) => emit("update:open", value),
});

const contentSeparatorPreview = computed(
	() =>
		`Term${getContentSeparator(
			importState.contentSeparator,
			importState.customContentSeparator,
		)}Definition`,
);

const cardSeparatorPreview = computed(
	() =>
		`Card1${getCardSeparator(
			importState.cardSeparator,
			importState.customCardSeparator,
		)}Card2`,
);

const parsedCards = computed(() => parseInput(importState.input));

function parseInput(input: string): ParsedImportCard[] {
	const contentSeparator = getContentSeparator(
		importState.contentSeparator,
		importState.customContentSeparator,
	);
	const cardSeparator = getCardSeparator(
		importState.cardSeparator,
		importState.customCardSeparator,
	);

	if (!input || !contentSeparator || !cardSeparator) return [];

	return input
		.split(cardSeparator)
		.filter((card) => card.trim().length)
		.map((card) => {
			const [term, definition] = card
				.split(contentSeparator)
				.filter((part) => part.trim().length)
				.map((part) => part.trim());

			return {
				term: term || "",
				definition: definition || "",
			};
		});
}

function validateParsedCards(cards: ParsedImportCard[]) {
	const validatedCards: CreateCardBody[] = [];

	for (const card of cards) {
		const parsedCard = v.safeParse(CREATE_CARD_SCHEMA, {
			term: card.term,
			definition: card.definition,
			termLanguage: "en",
			definitionLanguage: "vi",
		});

		if (!parsedCard.success) {
			toast.importCardsFailed(parsedCard.issues[0]?.message);
			return null;
		}

		validatedCards.push(parsedCard.output);
	}

	return validatedCards;
}

function closeModal() {
	isOpen.value = false;
}

async function handleImportCards(event: FormSubmitEvent<ImportCardsSchema>) {
	const cards = parseInput(event.data.input);
	const validatedCards = validateParsedCards(cards);

	if (!validatedCards?.length) return;

	emit("import", validatedCards);
	closeModal();
	toast.importCardsSuccess();
}
</script>

<template>
	<UModal
		v-model:open="isOpen"
		:ui="{
			title: 'text-xl sm:text-2xl',
			content:
				'sm:inset-x-16 sm:inset-y-8 lg:inset-x-32 lg:inset-y-16 sm:rounded-md',
		}"
		title="Import your cards"
		description="Copy and Paste your data here (from Word, Excel, Google Docs, CSV Files, etc.)"
		fullscreen
	>
		<template #body>
			<UForm
				:id="CreateDeckFormId.IMPORT_CARDS"
				:schema="IMPORT_CARD_SCHEMA"
				:state="importState"
				class="flex flex-col gap-4"
				@submit="handleImportCards"
			>
				<UFormField name="input">
					<UTextarea
						v-model="importState.input"
						:rows="7"
						:maxrows="10"
						class="w-full"
						variant="subtle"
						placeholder="Paste your data here..."
						autoresize
						autofocus
					/>
				</UFormField>

				<div class="flex flex-col place-items-start gap-3 sm:flex-row sm:gap-6">
					<div class="flex place-items-center gap-2">
						<UFormField
							:ui="{ help: 'whitespace-pre-wrap' }"
							:help="contentSeparatorPreview"
							name="contentSeparator"
						>
							<USelect
								v-model="importState.contentSeparator"
								:items="CONTENT_SEPARATOR_ITEMS"
								class="w-full"
								variant="subtle"
								value-key="id"
							/>

							<template #label>
								<h3 class="truncate font-semibold sm:text-lg">
									Content separator
								</h3>
							</template>
						</UFormField>

						<UFormField
							v-if="importState.contentSeparator === 'custom'"
							name="customContentSeparator"
						>
							<UInput
								v-model="importState.customContentSeparator"
								class="mt-1"
								placeholder="eg. -"
							/>
						</UFormField>
					</div>

					<div class="flex place-items-center gap-2">
						<UFormField
							:ui="{ help: 'whitespace-pre-wrap' }"
							:help="cardSeparatorPreview"
							name="cardSeparator"
						>
							<USelect
								v-model="importState.cardSeparator"
								:items="CARD_SEPARATOR_ITEMS"
								class="w-full"
								variant="subtle"
								value-key="id"
							/>

							<template #label>
								<h3 class="truncate font-semibold sm:text-lg">
									Card separator
								</h3>
							</template>
						</UFormField>

						<UFormField
							v-if="importState.cardSeparator === 'custom'"
							name="customCardSeparator"
						>
							<UInput
								v-model="importState.customCardSeparator"
								class="mt-1"
								placeholder="eg. \\n"
							/>
						</UFormField>
					</div>
				</div>

				<h3 class="font-semibold sm:text-lg">
					<span class="text-base font-normal">
						{{ parsedCards.length }} cards
					</span>
				</h3>

				<div class="flex flex-col gap-4">
					<UCard
						v-for="(card, index) in parsedCards"
						:key="index"
						class="bg-elevated"
						variant="subtle"
					>
						<div class="flex flex-col sm:flex-row">
							<UTextarea
								v-model="card.term"
								:rows="1"
								:maxrows="10"
								:ui="{
									base: 'sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
								}"
								class="w-full"
								variant="ghost"
								disabled
								autoresize
							/>

							<USeparator class="m-2 sm:hidden" />

							<USeparator
								orientation="vertical"
								class="m-2 hidden h-auto sm:block"
							/>

							<UTextarea
								v-model="card.definition"
								:rows="1"
								:maxrows="10"
								:ui="{
									base: 'sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
								}"
								class="w-full"
								variant="ghost"
								disabled
								autoresize
							/>
						</div>
					</UCard>
				</div>
			</UForm>
		</template>

		<template #footer>
			<div class="flex flex-1 place-content-end gap-2">
				<UButton
					class="cursor-pointer"
					label="Cancel"
					icon="i-lucide-x"
					color="neutral"
					variant="outline"
					@click="closeModal"
				/>

				<UButton
					:form="CreateDeckFormId.IMPORT_CARDS"
					class="cursor-pointer"
					label="Import"
					icon="i-lucide-copy-plus"
					variant="subtle"
					size="lg"
					type="submit"
				/>
			</div>
		</template>
	</UModal>
</template>
