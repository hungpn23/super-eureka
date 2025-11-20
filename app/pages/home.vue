<script lang="ts" setup>
import { DeckOrderBy, QueryOrder } from "~/utils/enums";
import { formatTimeAgo } from "@vueuse/core";

const defaults: DeckPaginationQuery = {
  page: "1",
  limit: "10",
  filter: "Recently",
  search: "",
};

const route = useRoute();
const toast = useToast();
const { token, data: user } = useAuth();

const urlParams = useUrlSearchParams<DeckPaginationQuery>("history", {
  initialValue: route.query as DeckPaginationQuery,
});

const page = computed({
  get: () => Number(urlParams.page || defaults.page),
  set: (val) => {
    urlParams.page = val === Number(defaults.page) ? undefined : String(val);
  },
});

const limit = computed({
  get: () => Number(urlParams.limit || defaults.limit),
  set: (val) => {
    urlParams.limit = val === Number(defaults.limit) ? undefined : String(val);
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
const debouncedSearch = refDebounced(search, 200);

watch(debouncedSearch, (newSearch) => {
  urlParams.search = newSearch === defaults.search ? undefined : newSearch;
  urlParams.page = undefined;
});

const query = computed(() => {
  let orderBy: DeckOrderBy = DeckOrderBy.OPENED_AT;
  let order: QueryOrder = QueryOrder.DESC_NULLS_LAST;

  switch (filter.value) {
    case "Recently":
      orderBy = DeckOrderBy.OPENED_AT;
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case "Newest":
      orderBy = DeckOrderBy.CREATED_AT;
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case "Oldest":
      orderBy = DeckOrderBy.CREATED_AT;
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case "Name A-Z":
      orderBy = DeckOrderBy.NAME;
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case "Name Z-A":
      orderBy = DeckOrderBy.NAME;
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

const { data: res, error } = await useLazyFetch<Paginated<Deck>, ErrorResponse>(
  "/api/decks",
  {
    query,
    headers: {
      Authorization: token.value || "",
    },
    server: false,
  },
);

const totalRecords = computed(() => res.value?.metadata.totalRecords || 0);

const selectItems = ref([
  "Recently",
  "Newest",
  "Oldest",
  "Name A-Z",
  "Name Z-A",
]);

const statsCards = [
  {
    title: "Today's Streak",
    value: "12",
    icon: "i-lucide-flame",
    color: "warning" as const,
  },
  {
    title: "Total Words Learned",
    value: "342",
    icon: "i-lucide-target",
    color: "info" as const,
  },
  {
    title: "Accuracy Rate",
    value: "87%",
    icon: "i-lucide-book-marked",
    color: "success" as const,
  },
];

if (error.value) {
  toast.add({
    title: "Error fetching decks",
    description: JSON.stringify(error.value?.data || "Unknown error"),
  });
}
</script>

<template>
  <UPage>
    <UContainer>
      <UPageHeader
        :title="`Welcome back, ${user?.username}!`"
        description="Continue learning and expand your vocabulary."
      >
        <UPageGrid class="mt-4">
          <UPageCard
            v-for="(c, index) in statsCards"
            :key="index"
            :class="`text-${c.color}`"
            variant="subtle"
            spotlight
            :spotlight-color="c.color"
          >
            <div class="flex place-content-between items-center">
              <h3>{{ c.title }}</h3>
              <UIcon :name="c.icon" size="2rem" />
            </div>

            <p :class="`text-3xl font-bold`">
              {{ c.value }}
            </p>
          </UPageCard>
        </UPageGrid>
      </UPageHeader>

      <UPageBody class="space-y-4">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:place-content-between sm:items-center"
        >
          <div class="flex items-center gap-4">
            <h2 class="text-highlighted text-xl text-pretty sm:text-2xl">
              Your Decks ({{ res?.data.length || 0 }})
            </h2>

            <UButton
              class="cursor-pointer"
              label="Add a new deck"
              icon="i-lucide-plus"
              to="/create-deck"
              size="lg"
            />
          </div>

          <div class="flex items-center gap-4">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search decks..."
            />

            <USelect v-model="filter" :items="selectItems" />
          </div>
        </div>

        <UPageList divide>
          <TransitionGroup name="list" appear>
            <UPageCard
              v-for="deck in res?.data || []"
              class="my-1"
              :key="deck.id"
              :description="
                deck.openedAt
                  ? `Last opened ${formatTimeAgo(new Date(deck.openedAt))}`
                  : 'Never opened'
              "
              variant="subtle"
              :to="`/${user?.username}/${deck.slug}?deckId=${deck.id}`"
            >
              <UProgress :model-value="50" />

              <template #title>
                <div class="flex items-center gap-2">
                  <span>{{ deck.name }}</span>
                  <UIcon :name="getVisibilityIcon(deck.visibility)" />
                </div>
              </template>
            </UPageCard>
          </TransitionGroup>
        </UPageList>

        <UPagination
          v-model:page="page"
          :total="totalRecords"
          :items-per-page="limit"
          :ui="{ root: 'flex place-content-center' }"
        />

        <UPageSection
          v-if="Array.isArray(res?.data) && res.data.length === 0"
          description="Click Create button to add your first deck!"
        />
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
