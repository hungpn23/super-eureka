<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { formatDistanceToNowStrict } from "date-fns";
import {
	UPDATE_DECK_SCHEMA,
	useDeckDelete,
	useDeckEdit,
	useFlashcardSession,
} from "~/features/deck";
import { ShortcutKey } from "~/shared/enums";

const { data: user } = useAuth();
const store = useDeckStore();

const {
	isSavingAnswers,
	flashcardSession,
	studyProgress,
	handleFlipCard,
	handleAnswer,
	handleShuffleCards,
} = useFlashcardSession();

const { isDeleting, handleDeleteDeck } = useDeckDelete();

const {
	formErrorMsg,
	isEditing,
	isSavingChanges,
	updateState,
	syncSavedCards,
	onSubmit,
	onSubmitError,
	handleStartEditing,
	handleCancelEditing,
	addCardFirst,
	addCardLast,
	removeCard,
} = useDeckEdit();

const settings = computed<DropdownMenuItem[][]>(() => [
	[
		{
			label: "Restart progress",
			icon: "i-lucide-refresh-cw",
			color: "warning",
			onSelect: store.handleRestartDeck,
		},
		{
			label: "Ignore review dates",
			icon: `i-lucide-calendar${store.isIgnoreDate ? "-off" : ""}`,
			type: "checkbox",
			checked: store.isIgnoreDate,
			onUpdateChecked: (checked) => store.handleCheckIgnoreDate(checked),
			onSelect: (e) => e.preventDefault(),
		},
		{
			label: "Edit deck",
			icon: "i-lucide-pencil-line",
			disabled: isEditing.value,
			onSelect: handleStartEditing,
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

watch(
	() => flashcardSession.savedCards,
	() => syncSavedCards(flashcardSession.savedCards),
);

defineShortcuts({
	[ShortcutKey.FLASHCARD_FLIP_CARD]: handleFlipCard,
	[ShortcutKey.NEXT_CARD]: () => handleAnswer(true),
	[ShortcutKey.PREV_CARD]: () => handleAnswer(false),
});
</script>

<template>
  <SkeletonDeckPage v-if="store.isFetchingDeck" />

  <UPage v-else>
    <UContainer>
      <UButton
        to="/library"
        class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
        variant="link"
        icon="i-lucide-move-left"
        label="Back to library"
      />

      <UForm
        :schema="UPDATE_DECK_SCHEMA"
        :state="updateState"
        @submit="onSubmit"
        @error="onSubmitError"
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
              <div
                v-if="flashcardSession.currentCard"
                class="flex w-full flex-col gap-2"
              >
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
                    {{ `${flashcardSession.knownCount} / ${flashcardSession.totalCards}` }}
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
                  class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
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

                    <CardStatusBadge :card="flashcardSession.currentCard" />
                  </div>

                  <div
                    v-if="flashcardSession.isCardFlipped"
                    class="flex w-full flex-col place-content-evenly place-items-stretch gap-6 px-2 sm:flex-row"
                  >
                    <div class="flex flex-col place-content-evenly gap-2">
                      <div class="text-xl font-medium sm:text-2xl">
                        {{ flashcardSession.currentCard.definition }}
                      </div>

                      <div v-if="flashcardSession.currentCard.examples.length">
                        <p class="text-sm font-medium">Examples:</p>

                        <ul class="list-disc pl-4">
                          <li
                            v-for="(example, i) in flashcardSession.currentCard.examples"
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
                      src="https://avatars.githubusercontent.com/u/177613774?v=4"
                      alt="User avatar"
                    />
                  </div>

                  <div v-else class="flex flex-col place-items-center sm:px-4">
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

                  <div />

                  <template #header>
                    <UProgress
                      :model-value="studyProgress"
                      :ui="{ base: 'bg-inherit' }"
                      size="sm"
                    />
                  </template>
                </UCard>

                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div class="col-span-1">
                    <UButton
                      v-if="user"
                      class="w-fit p-0 hover:bg-inherit active:bg-inherit"
                      variant="ghost"
                      color="neutral"
                    >
                      <div class="flex place-items-center gap-2">
                        <UAvatar
                          :ui="{ fallback: 'uppercase' }"
                          :src="user.avatarUrl || ''"
                          :alt="user.username"
                          class="cursor-pointer"
                          size="xl"
                        />

                        <div class="flex flex-col place-items-start">
                          <p class="text-muted text-sm font-normal text-pretty">
                            Created by
                          </p>

                          <NuxtLink
                            :to="`/${user.username}`"
                            class="cursor-default text-base font-medium hover:underline"
                          >
                            {{ user.username }}
                          </NuxtLink>
                        </div>
                      </div>
                    </UButton>
                  </div>

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
                        icon="i-heroicons-x-mark"
                        size="lg"
                        variant="subtle"
                        color="error"
                        class="cursor-pointer transition-all hover:scale-105 hover:shadow active:scale-90"
                        @click="handleAnswer(false)"
                      />
                    </UTooltip>

                    <UTooltip
                      :delay-duration="200"
                      :kbds="['arrowright']"
                      text="Next card"
                    >
                      <UButton
                        label="Next"
                        icon="i-heroicons-check"
                        size="lg"
                        variant="subtle"
                        color="success"
                        class="cursor-pointer transition-all hover:scale-105 hover:shadow active:scale-90"
                        @click="handleAnswer(true)"
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

              <AppEmpty v-else />
            </div>
          </template>
        </UPageHeader>

        <UPageBody class="mt-4 pb-0">
          <div class="flex flex-col gap-4">
            <div
              class="grid place-content-between place-items-center gap-4 sm:flex"
            >
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
                  :disabled="isSavingChanges"
                  @click="handleCancelEditing()"
                />

                <UButton
                  :loading="isSavingChanges"
                  :label="isSavingChanges ? 'Saving...' : 'Save Changes'"
                  class="cursor-pointer"
                  icon="i-lucide-save"
                  loading-icon="i-lucide-loader-circle"
                  type="submit"
                />
              </div>
            </div>

            <UAlert
              v-if="formErrorMsg"
              icon="i-lucide-alert-triangle"
              color="error"
              variant="soft"
              title="Validation Error"
              :description="formErrorMsg"
            />

            <UButton
              v-if="isEditing"
              :disabled="isSavingChanges"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardFirst"
            />

            <TransitionGroup name="list" appear>
              <UCard
                v-for="(c, index) in updateState.cards"
                :key="c.id"
                :ui="{ body: `${!isEditing ? 'px-2 sm:px-4' : ''}` }"
                class="bg-elevated"
                variant="subtle"
              >
                <div
                  :class="`mb-1 flex place-content-between place-items-center gap-2 ${isEditing ? 'px-0' : 'px-2.5'}`"
                >
                  <CardStatusBadge :card="c" />

                  <UButton
                    v-if="isEditing"
                    class="cursor-pointer"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="removeCard(c.id)"
                  />

                  <span
                    v-else-if="
                      !isEditing && c.reviewDate && c.status === 'known'
                    "
                    class="text-muted text-right text-sm text-balance"
                  >
                    Next review

                    {{
                      formatDistanceToNowStrict(c.reviewDate, {
                        addSuffix: true,
                        unit: 'day',
                        roundingMethod: 'ceil',
                      })
                    }}
                  </span>
                </div>

                <div class="flex flex-col sm:flex-row">
                  <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                    <UTextarea
                      v-model="c.term"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>

                  <USeparator class="m-2 sm:hidden" />

                  <USeparator
                    orientation="vertical"
                    class="m-2 hidden h-auto sm:block"
                  />

                  <UFormField
                    class="sm:flex-1"
                    :name="`cards.${index}.definition`"
                  >
                    <UTextarea
                      v-model="c.definition"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>
                </div>
              </UCard>
            </TransitionGroup>

            <UButton
              v-if="isEditing"
              :disabled="isSavingChanges"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardLast"
            />

            <div v-if="isEditing" class="flex gap-2 place-self-end">
              <UButton
                class="cursor-pointer"
                label="Cancel"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                :disabled="isSavingChanges"
                @click="handleCancelEditing()"
              />

              <UButton
                :loading="isSavingChanges"
                :label="isSavingChanges ? 'Saving...' : 'Save Changes'"
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
    </UContainer>
  </UPage>
</template>

<style scoped></style>
