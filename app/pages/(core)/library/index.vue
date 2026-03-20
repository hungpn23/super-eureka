<script lang="ts" setup>
import { formatTimeAgo } from "@vueuse/core";
import {
  type GetDecksData,
  type GetDecksResponse,
  USER_STATS_ITEMS,
  useDeckSearch,
  useDeckToasts,
} from "~/features/deck";
import { useStudyToasts } from "~/features/study";
import type { UserStats } from "~/features/user";
import { ShortcutKey } from "~/shared/enums";
import type { ErrorResponse } from "~/shared/types";
import { focusInput, getVisibilityIcon } from "~/shared/utils";

const toast = useDeckToasts();
const studyToast = useStudyToasts();
const { token, data: user } = useAuth();
const searchRef = useTemplateRef("searchInput");
const { page, limit, filter, filterItems, search, searchApiParams } =
  useDeckSearch();

const userStatistics = computed(() =>
  USER_STATS_ITEMS.map((item, index) => {
    if (!userStats.value) return item;

    const { currentStreak, longestStreak, totalCardsLearned, masteryRate } =
      userStats.value;

    let value = "";
    let bonus = "";
    if (index === 0) {
      value = currentStreak.toString();
      bonus = longestStreak.toString();
    } else if (index === 1) {
      value = totalCardsLearned.toString();
    } else if (index === 2) {
      value = `${masteryRate}%`;
    }

    return { ...item, value, bonus };
  }),
);

const { data: paginatedDecks, error: fetchDecksError } = useFetch<GetDecksResponse, ErrorResponse>(
  "/api/decks",
  {
    method: "GET",
    headers: { Authorization: token.value || "" },
    query: searchApiParams,
    lazy: true,
    server: false,
  },
);

const { data: userStats, error: getUserStatsError } = useFetch<
  UserStats,
  ErrorResponse
>("/api/study/stats", {
  method: "GET",
  headers: { Authorization: token.value || "" },
});

watch([fetchDecksError, getUserStatsError], () => {
  if (fetchDecksError.value) toast.getDecksFailed();
  if (getUserStatsError.value) studyToast.getUserStatsFailed();
});

function getDeckProgress(deck: GetDecksData) {
  const total = deck.stats.total;
  const known = deck.stats.known;

  if (total === 0) return 0;

  return Math.round((known / total) * 100);
}

defineShortcuts({
  [ShortcutKey.SEARCH]: () => {
    focusInput(searchRef.value?.inputRef);
  },
  [ShortcutKey.CREATE_DECK]: () => {
    navigateTo("/create-deck");
  },
});
</script>

<template>
  <UContainer>
    <UPageHeader
      :ui="{
        title: 'text-xl sm:text-2xl font-medium',
        description: 'mt-0 text-base sm:text-lg',
        container: 'space-y-4',
      }"
      class="my-4 border-0 py-0"
    >
      <template #title> Welcome back, {{ user?.username }}! </template>

      <!-- <template #description>
        <ProseBlockquote>
          {{ getDailyQuote()?.text }}

          <span class="inline-block space-x-2">
            <ProseIcon name="i-lucide-minus" />

            <span class="font-medium not-italic">
              {{ getDailyQuote()?.author }}
            </span>
          </span>
        </ProseBlockquote>
      </template> -->

      <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <UPageCard
          v-for="(item, index) in userStatistics"
          :key="index"
          :ui="{ container: 'gap-0 sm:gap-2 p-3 lg:p-4 sm:p-3' }"
          :class="`text-${item.color} flex-1`"
          :spotlight-color="item.color"
          spotlight
          variant="subtle"
        >
          <div class="flex place-content-between place-items-center gap-2">
            <h3 class="lg:text-lg">{{ item.title }}</h3>

            <UIcon :name="item.icon" class="size-5 sm:size-6 lg:size-7" />
          </div>

          <div class="flex place-content-between place-items-end">
            <p :class="`text-xl font-medium lg:text-2xl`">
              {{ item.value }}
            </p>

            <span v-if="item.bonus" class="text-muted font-medium">
              Longest: {{ item.bonus }}
            </span>
          </div>
        </UPageCard>
      </div>
    </UPageHeader>

    <UPageBody class="mt-2 space-y-4 sm:mt-4">
      <div
        class="flex flex-col place-content-between gap-2 sm:flex-row sm:gap-6"
      >
        <div class="flex place-items-center gap-4">
          <h2 class="text-xl text-nowrap sm:text-2xl">
            Decks ({{ paginatedDecks?.data.length || 0 }})
          </h2>

          <UButton
            class="cursor-pointer place-self-start transition-all"
            label="Add a new deck"
            variant="subtle"
            icon="i-lucide-plus"
            to="/create-deck"
          >
            <template #trailing>
              <UKbd class="hidden sm:flex" color="primary" value="a" />
            </template>
          </UButton>
        </div>

        <div
          class="flex w-full basis-2/3 place-content-end gap-2 place-self-end sm:gap-4"
        >
          <UInput
            ref="searchInput"
            v-model="search"
            class="flex-1"
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
      </div>

      <div
        v-if="paginatedDecks && paginatedDecks.metadata.totalRecords > 0"
        class="flex flex-col gap-2 sm:gap-4"
      >
        <TransitionGroup name="list" appear>
          <NuxtLink
            v-for="d in paginatedDecks.data"
            v-slot="{ navigate }"
            :key="d.id"
            :to="`/library/${d.slug}?deckId=${d.id}`"
            custom
          >
            <UCard
              :ui="{ body: 'space-y-2' }"
              class="shadow-md transition-all hover:translate-x-2"
              variant="subtle"
              @click="navigate"
            >
              <!-- Title -->
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

                <div class="text-muted text-start text-sm sm:text-end">
                  {{
                    d.openedAt
                      ? `Last opened ${formatTimeAgo(new Date(d.openedAt))}`
                      : "Never opened"
                  }}
                </div>
              </div>

              <div class="mt-4 flex place-items-center gap-2">
                <UTooltip :delay-duration="200" text="Total cards">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.stats.total"
                    class="min-w-12"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-gallery-horizontal-end"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Known cards">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.stats.known"
                    class="min-w-12"
                    variant="outline"
                    color="success"
                    icon="i-lucide-graduation-cap"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Learning cards">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.stats.learning"
                    class="min-w-12"
                    variant="outline"
                    color="warning"
                    icon="i-lucide-circle-dashed"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="New cards">
                  <UBadge
                    :ui="{ base: 'flex place-content-center' }"
                    :label="d.stats.new"
                    class="min-w-12"
                    variant="outline"
                    color="info"
                    icon="i-lucide-sparkles"
                  />
                </UTooltip>
              </div>

              <UProgress :model-value="getDeckProgress(d)" />
            </UCard>
          </NuxtLink>
        </TransitionGroup>
      </div>

      <UPageSection
        v-if="
          Array.isArray(paginatedDecks?.data) &&
          paginatedDecks.data.length === 0
        "
      >
        <template #description>
          <p v-if="!search">Click "Add" button to add your first deck!</p>
          <p v-else>No decks found matching your search.</p>
        </template>
      </UPageSection>

      <UPagination
        v-if="paginatedDecks && paginatedDecks.metadata.totalRecords > 0"
        v-model:page="page"
        :total="paginatedDecks.metadata.totalRecords"
        :items-per-page="Number(limit)"
        :ui="{ root: 'flex place-content-center' }"
      />
    </UPageBody>
  </UContainer>
</template>

<style scoped></style>
