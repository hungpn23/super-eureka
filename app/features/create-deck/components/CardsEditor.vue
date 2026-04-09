<script lang="ts" setup>
import {
	type CreateDeckCardFormState,
	createDeckCardFormState,
	DEFINITION_LANGUAGE_ITEMS,
	TERM_LANGUAGE_ITEMS,
	type TextareaRef,
	useCardsEditorSuggestions,
} from "~/features/create-deck";

const props = defineProps<{
	cards: CreateDeckCardFormState[];
}>();

const emit = defineEmits<{
	(event: "update:cards", value: CreateDeckCardFormState[]): void;
	(event: "update:card-image", payload: { cardId: string; file?: File }): void;
}>();

const cards = computed({
	get: () => props.cards,
	set: (value: CreateDeckCardFormState[]) => emit("update:cards", value),
});

const termRefs = useTemplateRef<TextareaRef[]>("termInput");
const definitionRefs = useTemplateRef<TextareaRef[]>("definitionInput");

const {
	handleAddExample,
	handleDefinitionChange,
	handleExampleInput,
	handleTermChange,
	handleTermTab,
	getDefinitionPlaceholder,
	getExamplePlaceholder,
	getPartOfSpeechPlaceholder,
	getPronunciationPlaceholder,
	getRenderableExampleCount,
	getTermPlaceholder,
	getUsageOrGrammarPlaceholder,
	isWord,
	shouldShowAcceptSuggestion,
} = useCardsEditorSuggestions(cards, termRefs, definitionRefs);

function addCard() {
	cards.value = [...cards.value, createDeckCardFormState()];
}

function removeCard(index: number) {
	const nextCards = [...cards.value];
	nextCards.splice(index, 1);
	cards.value = nextCards;
}

function handleCardImageSelect(cardId: string, file?: File) {
	emit("update:card-image", { cardId, file });
}

function handleCardImageRemove(cardId: string, removeFile: () => void) {
	removeFile();
	emit("update:card-image", { cardId, file: undefined });
}
</script>

<template>
	<div class="flex flex-col gap-4">
		<TransitionGroup name="list">
			<UCard
				v-for="(card, cIndex) in cards"
				:key="card.clientId"
				class="bg-elevated"
				variant="subtle"
			>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div class="flex h-fit flex-col gap-2">
						<div class="flex place-content-between place-items-center">
							<span class="font-medium"> {{ cIndex + 1 }} </span>

							<USelectMenu
								v-model="card.termLanguage"
								value-key="id"
								:ui="{ base: 'text-xs' }"
								:items="TERM_LANGUAGE_ITEMS"
							/>
						</div>

						<UFormField class="flex-1" :name="`cards.${cIndex}.term`">
							<UTextarea
								ref="termInput"
								v-model="card.term"
								class="w-full"
								autocomplete="off"
								autoresize
								:rows="1"
								:maxrows="10"
								:placeholder="getTermPlaceholder(card, cIndex)"
								@update:model-value="() => handleTermChange(card, cIndex)"
								@keydown.tab="
									(event: KeyboardEvent) => handleTermTab(event, card, cIndex)
								"
							/>
						</UFormField>

						<div v-if="isWord(card.term)" class="flex gap-1">
							<UFormField
								class="max-w-30"
								:name="`cards.${cIndex}.partOfSpeech`"
							>
								<UInput
									v-model="card.partOfSpeech"
									class="w-full"
									:placeholder="getPartOfSpeechPlaceholder(card, cIndex)"
									@vue:before-unmount="card.partOfSpeech = undefined"
								/>
							</UFormField>

							<UFormField class="grow" :name="`cards.${cIndex}.pronunciation`">
								<UInput
									v-model="card.pronunciation"
									class="w-full"
									:placeholder="getPronunciationPlaceholder(card, cIndex)"
									@vue:before-unmount="card.pronunciation = undefined"
								/>
							</UFormField>
						</div>

						<div v-else>
							<UFormField
								class="flex-1"
								:name="`cards.${cIndex}.usageOrGrammar`"
							>
								<UInput
									v-model="card.usageOrGrammar"
									class="w-full"
									:placeholder="getUsageOrGrammarPlaceholder(card, cIndex)"
									@vue:before-unmount="card.usageOrGrammar = undefined"
								/>
							</UFormField>
						</div>

						<span
							v-if="shouldShowAcceptSuggestion(card, cIndex)"
							class="text-muted text-sm"
						>
							Press <UKbd size="lg">tab</UKbd> to accept suggestion.
						</span>
					</div>

					<USeparator class="sm:hidden" />

					<div class="flex h-fit flex-col gap-2">
						<USelectMenu
							class="place-self-end"
							v-model="card.definitionLanguage"
							value-key="id"
							:ui="{ base: 'text-xs' }"
							:items="DEFINITION_LANGUAGE_ITEMS"
						/>

						<UFormField class="flex-1" :name="`cards.${cIndex}.definition`">
							<UTextarea
								ref="definitionInput"
								v-model="card.definition"
								:rows="1"
								:maxrows="10"
								:placeholder="getDefinitionPlaceholder(card, cIndex)"
								class="w-full"
								autocomplete="off"
								autoresize
								@update:model-value="() => handleDefinitionChange(card, cIndex)"
							/>
						</UFormField>

						<UFormField
							v-for="(_, eIndex) in getRenderableExampleCount(card, cIndex)"
							class="flex-1"
							:name="`cards.${cIndex}.examples.${eIndex}`"
						>
							<UInput
								:model-value="card.examples?.[eIndex] ?? ''"
								class="w-full"
								:placeholder="getExamplePlaceholder(card, cIndex, eIndex)"
								@update:model-value="
									(value) => handleExampleInput(card, cIndex, eIndex, value)
								"
							>
								<template #trailing>
									<UButton
										v-if="card.examples?.length"
										icon="i-lucide-x"
										variant="ghost"
										color="error"
										size="sm"
										tabindex="-1"
										@click="card.examples.splice(eIndex, 1)"
									/>
								</template>
							</UInput>
						</UFormField>

						<UButton
							class="w-fit"
							icon="i-lucide-plus"
							label="Add new example"
							variant="ghost"
							@click="handleAddExample(cIndex)"
						/>
					</div>
				</div>

				<UFormField
					class="mt-4"
					:name="`cards.${cIndex}.fileId`"
					label="Card image"
				>
					<UFileUpload
						v-slot="{ open, removeFile }"
						v-model="card.imageFile"
						accept="image/*"
						@update:model-value="
							(file) => handleCardImageSelect(card.clientId, file || undefined)
						"
					>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start">
							<div
								class="bg-muted flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border sm:w-40"
							>
								<img
									v-if="card.imageUrl"
									:src="card.imageUrl"
									:alt="`Card ${cIndex + 1} image preview`"
									class="h-full w-full object-cover"
								>

								<div
									v-else
									class="text-muted flex flex-col items-center gap-2 text-sm"
								>
									<UIcon
										:name="
											card.isUploadingImage
												? 'i-lucide-loader-circle'
												: 'i-lucide-image'
										"
										class="size-6"
										:class="{ 'animate-spin': card.isUploadingImage }"
									/>
									<span>
										{{ card.isUploadingImage
												? "Uploading image..."
												: "No image selected" }}
									</span>
								</div>
							</div>

							<div class="flex flex-1 flex-col gap-2">
								<p class="text-muted text-sm">
									Upload an image for this card if needed. When upload succeeds,
									the returned `fileId` will be sent when creating the deck.
								</p>

								<div class="flex flex-wrap gap-2">
									<UButton
										icon="i-lucide-image"
										color="primary"
										variant="soft"
										:loading="card.isUploadingImage"
										@click="open()"
									>
										Choose an image
									</UButton>

									<UButton
										v-if="card.imageFile || card.imageUrl"
										icon="i-lucide-trash-2"
										color="error"
										variant="ghost"
										@click="
											handleCardImageRemove(card.clientId, removeFile)
										"
									>
										Remove
									</UButton>
								</div>

								<p
									v-if="card.imageFile?.name"
									class="text-muted truncate text-xs"
								>
									{{ card.imageFile.name }}
								</p>
							</div>
						</div>
					</UFileUpload>
				</UFormField>

				<div class="flex place-content-end">
					<UButton
						label="Remove"
						icon="i-lucide-trash-2"
						color="error"
						variant="ghost"
						@click="removeCard(cIndex)"
					/>
				</div>
			</UCard>
		</TransitionGroup>

		<UCard
			class="hover:border-primary/75 hover:text-primary/75 border-accented text-muted flex h-28 cursor-pointer place-content-center place-items-center border-2 border-dashed ring-0 transition-all select-none active:scale-95"
			@click="addCard"
		>
			<div class="flex place-content-center place-items-center gap-2">
				<UIcon name="i-lucide-plus" class="size-8" />

				<span class="text-base font-semibold sm:text-lg"> Add new card </span>
			</div>
		</UCard>
	</div>
</template>
