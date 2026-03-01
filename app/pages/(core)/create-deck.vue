<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
	api,
	CARD_SEPARATOR_ITEMS,
	CONTENT_SEPARATOR_ITEMS,
	CREATE_DECK_SCHEMA,
	type CreateDeckSchema,
	DEFINITION_LANGUAGE_ITEMS,
	FormId,
	getNewCard,
	getVisibilityDesc,
	getVisibilityLabel,
	IMPORT_CARD_SCHEMA,
	TERM_LANGUAGE_ITEMS,
	useCardSuggestion,
	useCardsImport,
	useCreateDeckToasts,
	VISIBILITY_ITEMS,
} from "~/features/create-deck";
import { Visibility } from "~/features/deck";
import { focusInput, getVisibilityIcon } from "~/shared/utils";

const toast = useCreateDeckToasts();
const { token } = useAuth();

const passcodeRef = useTemplateRef("passcode");
const definitionRefs = useTemplateRef("definition");

const isVisibilityModalOpen = ref(false);
const formErrorMsg = ref("");

const createState = reactive<CreateDeckSchema>({
	name: "",
	description: "",
	visibility: Visibility.PUBLIC,
	cards: [getNewCard(), getNewCard(), getNewCard(), getNewCard()],
});

const {
	isImportModalOpen,
	importState,
	contentSeparatorPreview,
	cardSeparatorPreview,
	parsedCards,
	onImportSubmit,
} = useCardsImport(createState);

const {
	suggestion,
	debouncedGetCardSuggestion,
	isSuggestingThisCard,
	hasSuggestion,
	applySuggestion,
	isWord,
} = useCardSuggestion(definitionRefs);

const {
	execute: createDeck,
	pending: isCreating,
	data,
	error,
} = api.createDeck({ data: createState, token });

async function handleSubmit(event: FormSubmitEvent<CreateDeckSchema>) {
	formErrorMsg.value = "";

	Object.assign(createState, event.data);
	await createDeck();

	if (data.value?.slug) {
		navigateTo(`/library/${data.value.slug}`);
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
</script>

<template>
  <UContainer class="space-y-2">
    <UButton
      to="/library"
      class="cursor-pointer px-0 text-base"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to home"
    />

    <div class="space-y-2">
      <div class="flex place-content-between place-items-center gap-2">
        <h1 class="text-xl font-semibold text-nowrap sm:text-2xl">
          Create a new deck
        </h1>

        <UButton
          :form="FormId.CREATE_DECK"
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
      :id="FormId.CREATE_DECK"
      :schema="CREATE_DECK_SCHEMA"
      :state="createState"
      class="mt-4 flex flex-col gap-2"
      @submit="handleSubmit"
      @error="onValidationError"
    >
      <UFormField label="Name" name="name" required>
        <UInput
          v-model="createState.name"
          :ui="{ base: 'sm:text-lg' }"
          class="w-full"
          placeholder="Enter a name, like “Biology - Chapter 22: Evolution”"
        />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea
          v-model="createState.description"
          :rows="1"
          :maxrows="5"
          :ui="{ base: 'sm:text-lg' }"
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
        <h2 class="font-medium sm:text-lg">
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

      <div class="flex flex-col gap-4">
        <TransitionGroup name="list">
          <UCard
            v-for="(card, cIndex) in createState.cards"
            :key="cIndex"
            class="bg-elevated"
            variant="subtle"
          >
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex h-fit flex-col gap-2">
                <div class="flex place-content-between place-items-center">
                  <span class="text-base font-medium sm:text-lg">
                    {{ cIndex + 1 }}
                  </span>

                  <USelectMenu
                    v-model="card.termLanguage"
                    :items="TERM_LANGUAGE_ITEMS"
                    value-key="id"
                  />
                </div>

                <UFormField class="flex-1" :name="`cards.${cIndex}.term`">
                  <UTextarea
                    v-model="card.term"
                    :rows="1"
                    :maxrows="10"
                    :ui="{ base: 'text-base' }"
                    class="w-full"
                    placeholder="Enter your term..."
                    autoresize
                    @update:model-value="
                      () => debouncedGetCardSuggestion(card, cIndex)
                    "
                    @keydown.tab.prevent="() => applySuggestion(card, cIndex)"
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
                      :placeholder="
                        isSuggestingThisCard(cIndex)
                          ? suggestion.partOfSpeech
                          : 'eg. noun'
                      "
                      @vue:before-unmount="card.partOfSpeech = undefined"
                    />
                  </UFormField>

                  <UFormField
                    class="grow"
                    :name="`cards.${cIndex}.pronunciation`"
                  >
                    <UInput
                      v-model="card.pronunciation"
                      class="w-full"
                      :placeholder="
                        isSuggestingThisCard(cIndex)
                          ? suggestion.pronunciation
                          : 'eg. /heˈloʊ/'
                      "
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
                      :placeholder="
                        isSuggestingThisCard(cIndex)
                          ? suggestion.usageOrGrammar
                          : 'Enter your usage or grammar notes'
                      "
                      @vue:before-unmount="card.usageOrGrammar = undefined"
                    />
                  </UFormField>
                </div>

                <span
                  v-if="isSuggestingThisCard(cIndex) && hasSuggestion(card)"
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
                  :items="DEFINITION_LANGUAGE_ITEMS"
                  value-key="id"
                />

                <UFormField class="flex-1" :name="`cards.${cIndex}.definition`">
                  <UTextarea
                    ref="definition"
                    v-model="card.definition"
                    :rows="1"
                    :maxrows="10"
                    :ui="{ base: 'text-base' }"
                    :placeholder="
                      isSuggestingThisCard(cIndex)
                        ? suggestion.definition
                        : 'Enter your definition...'
                    "
                    class="w-full"
                    autoresize
                  />
                </UFormField>

                <UFormField
                  v-if="card.examples.length"
                  v-for="(_, eIndex) in card.examples"
                  class="flex-1"
                  :name="`cards.${cIndex}.examples.${eIndex}`"
                >
                  <UInput
                    v-model="card.examples[eIndex]"
                    class="w-full"
                    :placeholder="
                      isSuggestingThisCard(cIndex)
                        ? suggestion.examples[eIndex]
                        : 'eg. Hello, how are you?'
                    "
                  >
                    <template #trailing>
                      <UButton
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
                  @click="card.examples.push('')"
                />
              </div>
            </div>

            <UButton
              class="flex place-self-end"
              label="Remove"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="createState.cards.splice(cIndex, 1)"
            />
          </UCard>
        </TransitionGroup>

        <UCard
          class="hover:border-primary/75 hover:text-primary/75 border-accented text-muted flex h-28 cursor-pointer place-content-center place-items-center border-2 border-dashed ring-0 transition-all select-none active:scale-95"
          @click="createState.cards.push(getNewCard())"
        >
          <div class="flex place-content-center place-items-center gap-2">
            <UIcon name="i-lucide-plus" class="size-8" />

            <span class="text-base font-semibold sm:text-lg">
              Add new card
            </span>
          </div>
        </UCard>
      </div>

      <!-- Visibility Modal -->
      <UModal
        v-model:open="isVisibilityModalOpen"
        :ui="{ title: 'text-base sm:text-lg font-medium' }"
        title="Manage your deck access"
      >
        <template #body>
          <UFormField
            :help="getVisibilityDesc(createState.visibility)"
            label="Visibility"
            name="visibility"
          >
            <USelect
              v-model="createState.visibility"
              :items="VISIBILITY_ITEMS"
              :icon="getVisibilityIcon(createState.visibility)"
              :ui="{ content: 'min-w-fit' }"
              value-key="id"
              @change="
                createState.passcode =
                  createState.visibility === Visibility.PROTECTED
                    ? ''
                    : undefined
              "
            />
          </UFormField>

          <UFormField
            v-if="createState.visibility === Visibility.PROTECTED"
            class="mt-2"
            label="Passcode"
            name="passcode"
            required
          >
            <UInput
              ref="passcode"
              v-model="createState.passcode"
              @keydown.enter="isVisibilityModalOpen = false"
              @vue:mounted="focusInput(passcodeRef?.inputRef);"
            />
          </UFormField>
        </template>
      </UModal>
    </UForm>

    <!-- Import Cards Modal -->
    <UModal
      v-model:open="isImportModalOpen"
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
        <!-- Import Cards Form -->
        <UForm
          :id="FormId.IMPORT"
          :schema="IMPORT_CARD_SCHEMA"
          :state="importState"
          class="flex flex-col gap-4"
          @submit="onImportSubmit"
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

          <div
            class="flex flex-col place-items-start gap-3 sm:flex-row sm:gap-6"
          >
            <div class="flex place-items-center gap-2">
              <UFormField
                :ui="{
                  help: 'whitespace-pre-wrap',
                }"
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
                :ui="{
                  help: 'whitespace-pre-wrap',
                }"
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
                  placeholder="eg. \"
                />
              </UFormField>
            </div>
          </div>

          <h3 class="font-semibold sm:text-lg">
            Preview
            <span class="text-base font-normal"
              >{{ parsedCards.length }} cards</span
            >
          </h3>

          <div class="flex flex-col gap-4">
            <UCard
              v-for="(c, index) in parsedCards"
              :key="index"
              class="bg-elevated"
              variant="subtle"
            >
              <div class="flex flex-col sm:flex-row">
                <UTextarea
                  v-model="c.term"
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
                  v-model="c.definition"
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
            @click="isImportModalOpen = false"
          />

          <UButton
            :form="FormId.IMPORT"
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
  </UContainer>
</template>

<style scoped></style>
