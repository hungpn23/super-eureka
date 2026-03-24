<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { formatDistanceToNowStrict } from "date-fns";
import {
  DEFINITION_LANGUAGE_ITEMS,
  getVisibilityDesc,
  TERM_LANGUAGE_ITEMS,
  VISIBILITY_ITEMS,
} from "~/features/create-deck";
import {
  DeckFormId,
  useChangePasscode,
  useDeckDelete,
  useDeckUpdate,
  Visibility,
} from "~/features/deck";
import { useFlashcardStudy } from "~/features/study";
import { ShortcutKey } from "~/shared/enums";
import { focusInput, getVisibilityIcon } from "~/shared/utils";
import {
  UPDATE_DECK_SCHEMA,
  UPDATE_VISIBILITY_SCHEMA,
} from "~/valibot/schemas";

const { data: user } = useAuth();
const store = useDeckStore();
const { isDeleting, handleDeleteDeck } = useDeckDelete();

const {
  isSavingAnswers,
  flashcardSession,
  studyProgress,
  handleFlipCard,
  handleAnswer,
  handleShuffleCards,
} = useFlashcardStudy();

const {
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
} = useDeckUpdate();

const {
  isChanging,
  updateVisibilityState,
  isUpdateVisibilityModalOpen,
  handleUpdateVisibilitySubmit,
} = useChangePasscode();

const passcodeRef = useTemplateRef("passcodeInput");

const settings = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Restart progress",
      icon: "i-lucide-refresh-cw",
      color: "warning",
      onSelect: store.handleRestartDeck,
    },
    {
      label: "Edit deck",
      icon: "i-lucide-pencil-line",
      disabled: isEditing.value,
      onSelect: handleStartEditing,
    },
    {
      label: "Change passcode",
      icon: "i-lucide-book-key",
      disabled: isChanging.value,
      onSelect: () => {
        isUpdateVisibilityModalOpen.value = true;
      },
    },
  ],
  [
    {
      label: "Delete deck",
      icon: "i-lucide-trash-2",
      color: "error",
      disabled: isDeleting.value,
      onSelect: handleDeleteDeck,
    },
  ],
]);

const studyOptions = computed(() => [
  {
    label: "Flashcards",
    icon: "i-lucide-gallery-horizontal-end",
    to: `/library/${store.slug}/flashcards?deckId=${store.deckId}`,
  },
  {
    label: "Learn",
    icon: "i-lucide-notebook-pen",
    to: `/library/${store.slug}/learn?deckId=${store.deckId}`,
  },
  {
    label: "Test",
    icon: "i-lucide-flask-conical",
    to: `/library/${store.slug}/test?deckId=${store.deckId}`,
  },
  {
    label: "Coming soon",
    icon: "",
    to: `#`,
  },
]);
const isWord = (term: string) => !term.trim().includes(" ");

watch(
  () => flashcardSession.savedCards,
  () => {
    syncSavedCards(flashcardSession.savedCards);
  },
);

defineShortcuts({
  [ShortcutKey.FLASHCARD_FLIP_CARD]: handleFlipCard,
  [ShortcutKey.NEXT_CARD]: () => handleAnswer("correct"),
  [ShortcutKey.PREV_CARD]: () => handleAnswer("incorrect"),
});
</script>

<template>
  <UContainer v-if="flashcardSession.currentCard">
    <UButton
      class="px-0"
      to="/library"
      variant="link"
      label="Library"
      icon="i-lucide-move-left"
      size="lg"
    />

    <UForm
      :id="DeckFormId.UPDATE_DECK"
      :schema="UPDATE_DECK_SCHEMA"
      :state="updateState"
      @submit="handleUpdateSubmit"
      @error="handleUpdateError"
    >
      <UPageHeader :ui="{ title: 'flex-1' }" class="py-0 pb-8">
        <!-- Title and Description -->
        <template #title>
          <UFormField name="name">
            <UInput
              v-model="updateState.name"
              :disabled="!isEditing"
              :ui="{
                base: `${!isEditing ? 'p-0' : ''} bg-elevated/50 text-lg font-semibold text-pretty sm:text-xl disabled:opacity-100 disabled:cursor-default`,
              }"
              :variant="isEditing ? 'subtle' : 'ghost'"
              class="w-full"
              autoresize
            />
          </UFormField>

          <UFormField
            v-if="store.deck?.description"
            :class="`${isEditing ? 'mt-3' : ''}`"
            name="description"
          >
            <UTextarea
              v-model="updateState.description"
              :rows="1"
              :maxrows="10"
              :disabled="!isEditing"
              :ui="{
                base: `${!isEditing ? 'p-0' : ''} bg-elevated/50 text-base font-normal text-pretty disabled:opacity-100 disabled:cursor-default disabled:text-muted`,
              }"
              :variant="isEditing ? 'subtle' : 'ghost'"
              class="w-full"
              autoresize
            />
          </UFormField>
        </template>

        <template #default>
          <div class="mt-4 flex flex-col-reverse gap-4 lg:flex-col">
            <!-- Learning Options -->
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <UButton
                v-for="{ label, icon, to } in studyOptions"
                :key="label"
                :to="to"
                class="hover:ring-primary hover:text-primary hover:bg-primary/10 active:bg-primary/10 flex place-content-center place-items-center py-3 transition-all hover:scale-102 hover:shadow"
                variant="subtle"
                color="neutral"
              >
                <UIcon v-if="icon" :name="icon" class="size-5" />

                <h3 class="truncate text-base font-medium sm:text-lg">
                  {{ label }}
                </h3>
              </UButton>
            </div>

            <!-- Flashcard Study -->
            <div class="flex w-full flex-col gap-2">
              <!-- Status bar -->
              <div class="flex place-content-between">
                <div class="flex place-items-center gap-2">
                  <UBadge
                    :label="flashcardSession.skippedCount"
                    class="rounded-full px-2"
                    variant="subtle"
                    color="error"
                  />

                  <span class="text-error text-sm">Skipped</span>
                </div>

                <div>
                  {{
                    `${flashcardSession.knownCount} / ${flashcardSession.totalCards}`
                  }}
                </div>

                <div class="flex place-items-center gap-2">
                  <span class="text-success text-sm">Known</span>

                  <UBadge
                    :label="flashcardSession.knownCount"
                    class="rounded-full px-2"
                    variant="subtle"
                    color="success"
                  />
                </div>
              </div>

              <UCard
                :ui="{
                  header: 'p-0 sm:px-0',
                  body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
                }"
                class="bg-elevated flex min-h-[50dvh] flex-col divide-none"
                variant="subtle"
                @click="handleFlipCard"
              >
                <div
                  class="flex w-full place-content-between place-items-center"
                >
                  <span class="flex place-items-center gap-1 font-medium">
                    <UButton
                      class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                      icon="i-lucide-volume-2"
                      variant="soft"
                      color="neutral"
                      @click.stop="console.log('TTS not implemented yet')"
                    />

                    <span>{{
                      !flashcardSession.isCardFlipped
                        ? `Term (${flashcardSession.currentCard.termLanguage})`
                        : `Definition (${flashcardSession.currentCard.definitionLanguage})`
                    }}</span>
                  </span>

                  <CardStatusBadge
                    :status="flashcardSession.currentCard.status"
                  />
                </div>

                <div
                  class="card-flip-container w-full flex-1 flex flex-col place-content-center place-items-center"
                >
                  <Transition name="flip" mode="out-in">
                    <div
                      v-if="flashcardSession.isCardFlipped"
                      key="back"
                      class="flex w-full flex-col place-content-evenly place-items-stretch gap-6 px-2 sm:flex-row"
                    >
                      <div class="flex flex-col place-content-evenly gap-2">
                        <div class="text-xl font-medium sm:text-2xl">
                          {{ flashcardSession.currentCard.definition }}
                        </div>
                        <div
                          v-if="flashcardSession.currentCard.examples?.length"
                        >
                          <p class="text-sm font-medium">Examples:</p>
                          <ul class="list-disc pl-4">
                            <li
                              v-for="(example, i) in flashcardSession
                                .currentCard.examples"
                              :key="i"
                            >
                              <em>
                                {{ example }}
                                <span v-if="!example.endsWith('.')">.</span>
                              </em>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <NuxtImg
                        class="rounded-md"
                        src="https://avatars.githubusercontent.com/u/177613774?v=4"
                        alt="User avatar"
                      />
                    </div>

                    <div
                      v-else
                      key="front"
                      class="flex flex-col place-items-center sm:px-4"
                    >
                      <div class="space-x-2">
                        <span class="text-2xl font-medium sm:text-3xl">
                          {{ flashcardSession.currentCard.term }}
                        </span>
                        <span v-if="flashcardSession.currentCard.partOfSpeech">
                          ({{ flashcardSession.currentCard.partOfSpeech }})
                        </span>
                      </div>
                      <em v-if="flashcardSession.currentCard.pronunciation">
                        {{ flashcardSession.currentCard.pronunciation }}
                      </em>
                    </div>
                  </Transition>

                  <div />
                </div>

                <template #header>
                  <UProgress
                    :model-value="studyProgress"
                    :ui="{ base: 'bg-inherit' }"
                    size="sm"
                  />
                </template>
              </UCard>

              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <UUser
                  v-if="user"
                  class="col-span-1"
                  to="/profile"
                  target="_self"
                  description="Owner"
                  :name="user.username"
                  :avatar="{
                    src: user.avatar?.url || '',
                    alt: user.username,
                    loading: 'lazy',
                    icon: 'i-lucide-user',
                  }"
                />

                <div
                  class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
                >
                  <UTooltip
                    :delay-duration="200"
                    :kbds="['arrowleft']"
                    text="Skip this card"
                  >
                    <UButton
                      label="Skip"
                      icon="i-lucide-x"
                      size="lg"
                      variant="subtle"
                      color="error"
                      class="cursor-pointer transition-all hover:scale-103 hover:shadow active:scale-95"
                      @click="handleAnswer('incorrect')"
                    />
                  </UTooltip>

                  <UTooltip
                    :delay-duration="200"
                    :kbds="['arrowright']"
                    text="Next card"
                  >
                    <UButton
                      label="Next"
                      icon="i-lucide-check-check"
                      size="lg"
                      variant="subtle"
                      color="success"
                      class="cursor-pointer transition-all hover:scale-103 hover:shadow active:scale-95"
                      @click="handleAnswer('correct')"
                    />
                  </UTooltip>
                </div>

                <div
                  class="col-span-1 flex place-content-end place-items-center gap-1"
                >
                  <UButton
                    class="h-fit cursor-pointer transition-all active:scale-80"
                    color="neutral"
                    icon="i-lucide-shuffle"
                    variant="ghost"
                    size="lg"
                    @click="handleShuffleCards"
                  />

                  <UDropdownMenu :items="settings">
                    <UButton
                      class="h-fit cursor-pointer"
                      color="neutral"
                      icon="i-lucide-settings"
                      variant="ghost"
                      size="lg"
                    />
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UPageHeader>

      <UPageBody v-if="updateState.cards?.length" class="mt-4 pb-0">
        <div class="flex flex-col gap-4">
          <div class="flex place-content-between place-items-center gap-4">
            <h2
              class="flex place-items-center gap-1 text-lg font-medium sm:text-xl"
            >
              Cards ({{ updateState.cards?.length || 0 }})

              <span v-if="!isEditing" class="inline-flex">
                <UIcon
                  v-if="!isSavingAnswers"
                  class="text-success size-6"
                  name="i-lucide-check"
                />

                <span
                  v-else
                  class="ml-2 place-self-end-safe text-base font-normal text-current/75 sm:text-lg"
                >
                  Saving...
                </span>
              </span>
            </h2>

            <div v-if="isEditing" class="flex gap-2 place-self-end">
              <UButton
                class="cursor-pointer"
                label="Cancel"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                :disabled="isUpdating"
                @click="handleCancelEditing()"
              />

              <UButton
                class="cursor-pointer"
                icon="i-lucide-save"
                loading-icon="i-lucide-loader-circle"
                type="submit"
                :form="DeckFormId.UPDATE_DECK"
                :loading="isUpdating"
                :disabled="isUpdating"
                :label="isUpdating ? 'Saving...' : 'Save'"
              />
            </div>
          </div>

          <UAlert
            v-if="updateFormErrorMessage"
            icon="i-lucide-alert-triangle"
            color="error"
            variant="soft"
            title="Validation Error"
            :description="updateFormErrorMessage"
          />

          <UButton
            v-if="isEditing"
            :disabled="isUpdating"
            class="cursor-pointer place-self-center px-4"
            label="Add a card"
            icon="i-lucide-plus"
            variant="subtle"
            size="xl"
            @click="handleUnshiftCard"
          />

          <TransitionGroup name="list" appear>
            <UCard
              v-for="(card, cIndex) in updateState.cards"
              :key="card.id"
              :ui="{ body: `${!isEditing ? 'px-2 sm:px-4' : ''}` }"
              class="bg-elevated"
              variant="subtle"
            >
              <div
                :class="`mb-1 flex place-content-between place-items-center gap-2 ${isEditing ? 'px-0' : 'px-2.5'}`"
              >
                <CardStatusBadge :status="card.status" />

                <UButton
                  v-if="isEditing"
                  class="cursor-pointer"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  @click="handleRemoveCard(card.id)"
                />

                <span
                  v-else-if="
                    !isEditing && card.reviewDate && card.status === 'known'
                  "
                  class="text-muted text-right text-sm text-balance"
                >
                  Next review

                  {{
                    formatDistanceToNowStrict(card.reviewDate, {
                      addSuffix: true,
                      unit: "day",
                      roundingMethod: "ceil",
                    })
                  }}
                </span>
              </div>

              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div :class="`flex h-fit flex-col ${isEditing ? 'gap-1' : ''}`">
                  <USelectMenu
                    v-if="isEditing"
                    v-model="card.termLanguage"
                    :items="TERM_LANGUAGE_ITEMS"
                    class="place-self-end"
                    value-key="id"
                  />

                  <UFormField class="flex-1" :name="`cards.${cIndex}.term`">
                    <UTextarea
                      v-model="card.term"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: `text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default ${!isEditing ? 'py-0' : ''}`,
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
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
                        placeholder="eg. noun"
                        :ui="{
                          base: !isEditing ? 'py-0' : '',
                        }"
                        :disabled="!isEditing"
                        :variant="isEditing ? 'outline' : 'ghost'"
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
                        placeholder="eg. /heˈloʊ/"
                        :ui="{ base: !isEditing ? 'py-0' : '' }"
                        :disabled="!isEditing"
                        :variant="isEditing ? 'outline' : 'ghost'"
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
                        placeholder="Enter your usage or grammar notes"
                        :ui="{ base: !isEditing ? 'py-0' : '' }"
                        :disabled="!isEditing"
                        :variant="isEditing ? 'outline' : 'ghost'"
                        @vue:before-unmount="card.usageOrGrammar = undefined"
                      />
                    </UFormField>
                  </div>
                </div>

                <div :class="`flex h-fit flex-col ${isEditing ? 'gap-1' : ''}`">
                  <USelectMenu
                    v-if="isEditing"
                    v-model="card.definitionLanguage"
                    class="place-self-end"
                    value-key="id"
                    :items="DEFINITION_LANGUAGE_ITEMS"
                  />

                  <UFormField
                    class="flex-1"
                    :name="`cards.${cIndex}.definition`"
                  >
                    <UTextarea
                      v-model="card.definition"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: `text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default ${!isEditing ? 'py-0' : ''}`,
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>

                  <UFormField
                    v-if="card.examples"
                    v-for="(_, eIndex) in card.examples"
                    class="flex-1"
                    :name="`cards.${cIndex}.examples.${eIndex}`"
                  >
                    <UInput
                      v-model="card.examples[eIndex]"
                      class="w-full"
                      placeholder="eg. Hello, how are you?"
                      :ui="{ base: !isEditing ? 'py-0' : '' }"
                      :disabled="!isEditing"
                      :variant="isEditing ? 'outline' : 'ghost'"
                    >
                      <template #trailing>
                        <UButton
                          v-if="isEditing"
                          icon="i-lucide-x"
                          variant="ghost"
                          color="error"
                          size="sm"
                          tabindex="-1"
                          @click="handleRemoveExample(cIndex, eIndex)"
                        />
                      </template>
                    </UInput>
                  </UFormField>

                  <UButton
                    v-if="isEditing"
                    class="w-fit"
                    icon="i-lucide-plus"
                    label="Add new example"
                    variant="ghost"
                    @click="handleAddExample(cIndex)"
                  />
                </div>
              </div>
            </UCard>
          </TransitionGroup>

          <UButton
            v-if="isEditing"
            :disabled="isUpdating"
            class="cursor-pointer place-self-center px-4"
            label="Add a card"
            icon="i-lucide-plus"
            variant="subtle"
            size="xl"
            @click="handlePushCard"
          />

          <div v-if="isEditing" class="flex gap-2 place-self-end">
            <UButton
              class="cursor-pointer"
              label="Cancel"
              icon="i-lucide-x"
              color="neutral"
              variant="outline"
              :disabled="isUpdating"
              @click="handleCancelEditing()"
            />

            <UButton
              :loading="isUpdating"
              :label="isUpdating ? 'Saving...' : 'Save Changes'"
              class="cursor-pointer"
              color="primary"
              icon="i-lucide-save"
              loading-icon="i-lucide-loader-circle"
              type="submit"
            />
          </div>
        </div>
      </UPageBody>
    </UForm>

    <!-- Visibility Modal -->
    <UModal
      v-model:open="isUpdateVisibilityModalOpen"
      :ui="{ title: 'text-base sm:text-lg font-medium' }"
      title="Manage your deck access"
    >
      <template #body>
        <UForm
          :id="DeckFormId.UPDATE_VISIBILITY"
          :schema="UPDATE_VISIBILITY_SCHEMA"
          :state="updateVisibilityState"
          class="flex flex-col gap-4"
          @submit="handleUpdateVisibilitySubmit"
        >
          <UFormField
            :help="getVisibilityDesc(updateVisibilityState.visibility)"
            label="Visibility"
            name="visibility"
          >
            <USelect
              v-model="updateVisibilityState.visibility"
              :items="VISIBILITY_ITEMS"
              :icon="getVisibilityIcon(updateVisibilityState.visibility)"
              :ui="{ content: 'min-w-fit' }"
              value-key="id"
              @change="
                updateVisibilityState.passcode =
                  updateVisibilityState.visibility === Visibility.PROTECTED
                    ? ''
                    : undefined
              "
            />
          </UFormField>

          <UFormField
            v-if="updateVisibilityState.visibility === Visibility.PROTECTED"
            class="mt-2"
            label="Passcode"
            name="passcode"
            required
          >
            <UInput
              ref="passcodeInput"
              v-model="updateVisibilityState.passcode"
              @keydown.enter="isUpdateVisibilityModalOpen = false"
              @vue:mounted="focusInput(passcodeRef?.inputRef, 300)"
            />
          </UFormField>
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
            @click="isUpdateVisibilityModalOpen = false"
          />

          <UButton
            :form="DeckFormId.UPDATE_VISIBILITY"
            class="cursor-pointer"
            label="Confirm"
            icon="i-lucide-check"
            variant="subtle"
            type="submit"
          />
        </div>
      </template>
    </UModal>
  </UContainer>

  <AppEmpty v-else-if="!store.isFetchingDeck" />
</template>

<style scoped>
.card-flip-container {
  perspective: 1000px;
}

/* Flip từ front → back */
.flip-enter-active {
  animation: flip-in 0.25s ease-out;
}
.flip-leave-active {
  animation: flip-out 0.25s ease-in;
}

@keyframes flip-out {
  from {
    transform: rotateY(0deg);
    opacity: 1;
  }
  to {
    transform: rotateY(90deg);
    opacity: 0;
  }
}

@keyframes flip-in {
  from {
    transform: rotateY(-90deg);
    opacity: 0;
  }
  to {
    transform: rotateY(0deg);
    opacity: 1;
  }
}
</style>
