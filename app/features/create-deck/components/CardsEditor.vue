<script lang="ts" setup>
import {
	type CreateCardState,
	createDeckCardFormState,
	DEFINITION_LANGUAGE_ITEMS,
	TERM_LANGUAGE_ITEMS,
	type TextareaRef,
	useCardsEditorSuggestions,
} from "~/features/create-deck";

const props = defineProps<{
	cards: CreateCardState[];
}>();

const emit = defineEmits<{
	(event: "update:cards", value: CreateCardState[]): void;
	(
		event: "update:card-image",
		payload: { tempId: string; file?: File | null },
	): void;
}>();

const cards = computed({
	get: () => props.cards,
	set: (value: CreateCardState[]) => emit("update:cards", value),
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
</script>

<template>
	<div class="flex flex-col gap-4">
		<TransitionGroup name="list">
			<UCard
				v-for="(card, cIndex) in cards"
				:key="card.tempId"
				class="group"
				variant="subtle"
			>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div class="flex h-fit flex-col gap-2">
						<USelectMenu
							class="place-self-start"
							v-model="card.termLanguage"
							value-key="id"
							:ui="{ base: 'text-xs' }"
							:items="TERM_LANGUAGE_ITEMS"
						/>

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
						<div class="flex place-content-between place-items-center">
							<USelectMenu
								class="place-self-start"
								v-model="card.definitionLanguage"
								value-key="id"
								:ui="{ base: 'text-xs' }"
								:items="DEFINITION_LANGUAGE_ITEMS"
							/>

							<UButton
								class="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
								icon="i-lucide-trash-2"
								color="error"
								variant="ghost"
								size="sm"
								@click="removeCard(cIndex)"
							/>
						</div>

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
										class="p-1"
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
					class="mt-4 place-self-center"
					:name="`cards.${cIndex}.fileId`"
				>
					<UFileUpload
						v-model="card.image"
						class="w-64"
						accept="image/png, image/jpeg, image/jpg, image/webp"
						label="Drop your image here"
						description="PNG, JPG, JPEG or WEBP (max. 5MB)"
						color="neutral"
						@update:model-value="
							(file) => emit('update:card-image', { tempId: card.tempId, file })
						"
					/>
				</UFormField>
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
