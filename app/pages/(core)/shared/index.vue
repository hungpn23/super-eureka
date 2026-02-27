<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import { formatTimeAgo } from "@vueuse/core";
import {
	api,
	CLONE_DECK_SCHEMA,
	type CloneDeckSchema,
	type GetSharedDecksData,
	useDeckClone,
	useDeckSearch,
	useDeckToasts,
	Visibility,
} from "~/features/deck";
import type { UUID } from "~/shared/types";
import { focusInput, getVisibilityIcon } from "~/shared/utils";

definePageMeta({ auth: false });

const toast = useDeckToasts();
const { token, data: user } = useAuth();
const { page, limit, filter, search, filterItems, searchQuery } =
	useDeckSearch();
const { state, isModalOpen } = useDeckClone();

const searchInput = useTemplateRef("input");

const deckId = ref<UUID | null>(null);

const totalRecords = computed(
	() => paginated.value?.metadata.totalRecords || 0,
);

const query = computed(() => ({
	...searchQuery.value,
	visitorId: user.value?.id,
}));

const {
	execute: cloneDeck,
	error: cloneError,
	pending: isCloning,
	data: cloneResponse,
} = api.cloneDeck({ deckId, token, state });

const { data: paginated, error: getDecksError } = api.getSharedDecks({
	query,
	token,
});

watch([getDecksError, cloneError], () => {
	if (getDecksError.value) toast.getSharedDecksFailed();
	if (cloneError.value) toast.cloneDeckFailed();
});

watch(cloneResponse, () => {
	if (cloneResponse.value?.success) {
		toast.cloneDeckSuccess();
		return navigateTo("/library");
	}
});

async function handleAddToLibrary(deck: GetSharedDecksData) {
	if (!token.value) {
		toast.guestAddDeckToLibrary();
		navigateTo("/login");
	}

	deckId.value = deck.id;

	if (deck.visibility === Visibility.PROTECTED) {
		state.passcode = "";
		isModalOpen.value = true;
		return;
	}

	await cloneDeck();
}

async function handleSubmit(event: FormSubmitEvent<CloneDeckSchema>) {
	state.passcode = event.data.passcode;
	isModalOpen.reset();
	await cloneDeck();
}

defineShortcuts({
	"/": () => {
		focusInput(searchInput.value?.inputRef);
	},
});
</script>

<template>
  <UContainer class="mt-4 space-y-2">
    <h1 class="mb-4 text-xl font-medium sm:text-2xl">
      Browse decks shared by community
    </h1>

    <div class="flex w-full place-content-between gap-2">
      <UInput
        ref="input"
        v-model="search"
        class="sm:basis-1/2"
        icon="i-lucide-search"
        placeholder="Search decks..."
        autofocus
      >
        <template #trailing>
          <UKbd class="hidden sm:flex" value="/" />
        </template>
      </UInput>

      <USelect v-model="filter" :items="filterItems" value-key="id" />
    </div>

    <div
      v-if="paginated && paginated.metadata.totalRecords > 0"
      class="flex flex-col gap-4"
    >
      <TransitionGroup name="list" appear>
        <NuxtLink
          v-for="d in paginated.data"
          v-slot="{ navigate }"
          :key="d.id"
          :to="`/shared/${d.owner.username}/${d.slug}?deckId=${d.id}`"
          custom
        >
          <UCard
            :ui="{ body: 'flex flex-col gap-2' }"
            class="shadow-md transition-all hover:translate-x-3"
            variant="subtle"
            @click="navigate"
          >
            <div
              class="flex flex-col sm:flex-row sm:place-items-center sm:gap-8"
            >
              <div class="flex min-w-0 flex-1 place-items-center gap-1.5">
                <h4 class="truncate font-medium sm:text-lg">
                  {{ d.name }}
                </h4>

                <UIcon
                  :name="getVisibilityIcon(d.visibility)"
                  class="shrink-0 sm:size-5"
                />
              </div>

              <div
                class="flex place-content-start place-items-center gap-1.5 sm:place-content-end"
              >
                <UTooltip :delay-duration="200" text="Total cards">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.totalCards"
                    class="min-w-12"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-gallery-horizontal-end"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Views">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.viewCount"
                    class="min-w-12"
                    icon="i-lucide-eye"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Learners">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.learnerCount"
                    class="min-w-12"
                    icon="i-lucide-users"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>
              </div>
            </div>

            <div class="flex place-content-between place-items-center gap-2">
              <UButton
                class="w-fit p-0 hover:bg-inherit active:bg-inherit"
                variant="ghost"
                color="neutral"
              >
                <div class="flex place-items-center gap-2">
                  <UAvatar
                    :ui="{ fallback: 'uppercase' }"
                    :src="d.owner.avatarUrl || ''"
                    :alt="d.owner.username"
                  />

                  <div class="flex flex-col place-items-start">
                    <NuxtLink
                      :to="`/shared/${d.owner.username}`"
                      class="cursor-default place-self-start text-sm font-medium hover:underline sm:text-base"
                    >
                      {{ d.owner.username }}
                    </NuxtLink>

                    <p class="text-muted text-sm font-normal">
                      {{ `Created ${formatTimeAgo(new Date(d.createdAt))}` }}
                    </p>
                  </div>
                </div>
              </UButton>

              <UButton
                :ui="{ label: 'hidden sm:inline' }"
                class="cursor-pointer transition-all active:scale-90"
                label="Add to library"
                icon="i-lucide-plus"
                variant="subtle"
                @click.stop="() => handleAddToLibrary(d)"
              />
            </div>
          </UCard>
        </NuxtLink>
      </TransitionGroup>
    </div>

    <div
      v-if="Array.isArray(paginated?.data) && paginated.data.length === 0"
      class="mt-12 flex flex-col items-center justify-center text-center"
    >
      <p class="text-muted text-lg">No decks found matching your search.</p>
    </div>

    <UPagination
      v-if="totalRecords > 0"
      v-model:page="page"
      :total="totalRecords"
      :items-per-page="Number(limit)"
      :ui="{ root: 'flex place-content-center mt-6' }"
    />

    <UModal
      v-model:open="isModalOpen"
      :ui="{ footer: 'place-content-end' }"
      title="Hold on!"
      description="This deck is protected. Please enter the passcode to continue."
    >
      <template #body>
        <UForm
          id="passcode-form"
          :schema="CLONE_DECK_SCHEMA"
          :state="state"
          @submit="handleSubmit"
        >
          <UFormField name="passcode" label="Passcode" required>
            <UInput
              v-model="state.passcode"
              type="password"
              placeholder="Enter passcode"
              autofocus
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer="{ close }">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          :disabled="isCloning"
          @click="close"
        />

        <UButton form="passcode-form" type="submit">Add to Library</UButton>
      </template>
    </UModal>
  </UContainer>
</template>
