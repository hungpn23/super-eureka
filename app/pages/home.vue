<script lang="ts" setup>
import { formatTimeAgo } from '@vueuse/core';
import type { SelectMenuItem } from '@nuxt/ui';
import type { UserStats } from '~~/shared/types/deck';
import { userStatsItems } from '~/utils/constants';

const defaults: DeckUrlParams = {
  page: '1',
  limit: '10',
  filter: 'recently',
  search: '',
} as const;

const toast = useToast();
const { token, data: user } = useAuth();
const urlParams = useUrlSearchParams<Partial<DeckUrlParams>>('history');

const filterItems = ref<SelectMenuItem[]>(deckFilterItems);

const page = computed({
  get: () => Number(urlParams.page || defaults.page),
  set: (val) => {
    urlParams.page = val === +defaults.page ? undefined : String(val);
  },
});

const limit = computed({
  get: () => String(urlParams.limit || defaults.limit),
  set: (val) => {
    urlParams.limit = val === defaults.limit ? undefined : val;
    urlParams.page = undefined;
  },
});

const filter = computed({
  get: () => urlParams.filter || defaults.filter,
  set: (val) => {
    urlParams.filter = val === defaults.filter ? undefined : val;
    urlParams.page = undefined;
  },
});

const search = ref(urlParams.search || defaults.search);
const debouncedSearch = refDebounced(search, 300);

watch(debouncedSearch, (newSearch) => {
  urlParams.search = newSearch === defaults.search ? undefined : newSearch;
  urlParams.page = undefined;
});

const query = computed(() => {
  let orderBy: DeckOrderBy = 'openedAt';
  let order: QueryOrder = QueryOrder.DESC_NULLS_LAST;

  switch (filter.value) {
    case 'recently':
      orderBy = 'openedAt';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case 'newest':
      orderBy = 'createdAt';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case 'oldest':
      orderBy = 'createdAt';
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case 'name_az':
      orderBy = 'name';
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case 'name_za':
      orderBy = 'name';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
  }

  return {
    page: page.value,
    limit: limit.value,
    search: debouncedSearch.value,
    orderBy,
    order,
  };
});

const totalRecords = computed(
  () => paginated.value?.metadata.totalRecords || 0,
);

const computedUserStatItems = computed(() =>
  userStatsItems.map((item, index) => {
    if (!userStats.value) return item;

    const { currentStreak, longestStreak, totalCardsLearned, masteryRate } =
      userStats.value;

    let value = '';
    let bonus = '';
    if (index === 0) {
      value = currentStreak.toString();
      bonus = longestStreak.toString();
    } else if (index === 1) {
      value = totalCardsLearned.toString();
    } else if (index === 2) {
      value = masteryRate.toString() + '%';
    }

    return { ...item, value, bonus };
  }),
);

const {
  data: paginated,
  error,
  status,
} = useLazyFetch<Paginated<DeckWithStats>, ErrorResponse>('/api/decks', {
  query,
  headers: { Authorization: token.value || '' },
  server: false,
});

const { data: userStats, error: userStatsError } = await useFetch<
  UserStats,
  ErrorResponse
>('/api/study/stats', {
  headers: { Authorization: token.value || '' },
});

watch([error, userStatsError], (newErr) => {
  if (newErr) toast.add({ title: 'Error fetching decks' });
});

function getDeckProgress(deck: DeckWithStats) {
  const total = deck.stats.total;
  const known = deck.stats.known;

  if (total === 0) return 0;

  return Math.round((known / total) * 100);
}
</script>

<template>
  <SkeletonHomePage v-if="status === 'idle' || status === 'pending'" />

  <UPage v-else>
    <UContainer>
      <UPageHeader
        :ui="{
          title: 'text-xl sm:text-2xl font-medium',
          description: 'mt-0 text-base sm:text-lg',
          container: 'space-y-4',
        }"
        class="my-4 border-0 py-0"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <UPageCard
            v-for="(item, index) in computedUserStatItems"
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

        <template #title> Welcome back, {{ user?.username }}! </template>

        <template #description>
          <ProseBlockquote>
            {{ getDailyQuote()?.text }}

            <span class="inline-block space-x-2">
              <ProseIcon name="i-lucide-minus" />

              <span class="font-medium not-italic">
                {{ getDailyQuote()?.author }}
              </span>
            </span>
          </ProseBlockquote>
        </template>
      </UPageHeader>

      <UPageBody class="mt-2 space-y-4 sm:mt-4">
        <div class="flex flex-col place-content-between sm:flex-row sm:gap-8">
          <div class="flex place-items-center gap-4">
            <h2 class="text-xl text-nowrap sm:text-2xl">
              Decks ({{ paginated?.data.length || 0 }})
            </h2>

            <UButton
              class="cursor-pointer place-self-start transition-all hover:scale-105"
              label="Add"
              variant="subtle"
              icon="i-lucide-plus"
              to="/create-deck"
              size="lg"
            />
          </div>

          <div
            class="flex w-full basis-2/3 place-content-end gap-2 place-self-end sm:gap-4"
          >
            <UInput
              v-model="search"
              class="flex-1"
              icon="i-lucide-search"
              placeholder="Search decks..."
            />

            <USelect v-model="filter" :items="filterItems" value-key="id" />
          </div>
        </div>

        <div
          v-if="paginated && paginated.metadata.totalRecords > 0"
          class="flex flex-col gap-2 sm:gap-4"
        >
          <TransitionGroup name="list" appear>
            <NuxtLink
              v-for="d in paginated.data"
              :key="d.id"
              :to="`/${user?.username}/${d.slug}?deckId=${d.id}`"
            >
              <UCard
                class="hover:bg-elevated cursor-pointer shadow-md transition-all hover:scale-101"
                variant="subtle"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2">
                  <div class="flex place-items-center gap-1.5">
                    <h4 class="max-w-5/6 truncate font-medium sm:text-lg">
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
                        : 'Never opened'
                    }}
                  </div>
                </div>

                <div class="mt-2 flex place-items-center gap-2 sm:gap-4">
                  <UTooltip :delay-duration="200" text="Known cards">
                    <UBadge
                      :label="d.stats.known"
                      variant="soft"
                      color="success"
                      icon="i-lucide-circle-check"
                    />
                  </UTooltip>

                  <UTooltip :delay-duration="200" text="Learning cards">
                    <UBadge
                      :label="d.stats.learning"
                      variant="soft"
                      color="warning"
                      icon="i-lucide-circle-dashed"
                    />
                  </UTooltip>

                  <UTooltip :delay-duration="200" text="New cards">
                    <UBadge
                      :label="d.stats.new"
                      variant="soft"
                      color="info"
                      icon="i-lucide-sparkles"
                    />
                  </UTooltip>

                  <UTooltip :delay-duration="200" text="Total cards">
                    <UBadge
                      :label="d.stats.total"
                      variant="soft"
                      color="neutral"
                      icon="i-lucide-gallery-horizontal-end"
                    />
                  </UTooltip>
                </div>

                <UProgress :model-value="getDeckProgress(d)" class="mt-4" />
              </UCard>
            </NuxtLink>
          </TransitionGroup>
        </div>

        <UPageSection
          v-if="Array.isArray(paginated?.data) && paginated.data.length === 0"
        >
          <template #description>
            <p v-if="!search">Click Create button to add your first deck!</p>
            <p v-else>No decks found matching your search.</p>
          </template>
        </UPageSection>

        <UPagination
          v-model:page="page"
          :total="totalRecords"
          :items-per-page="Number(limit)"
          :ui="{ root: 'flex place-content-center' }"
        />
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
