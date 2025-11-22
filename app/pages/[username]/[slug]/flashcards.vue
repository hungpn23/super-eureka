<script setup lang="ts">
const { token, data: user } = useAuth();
const route = useRoute();

const cards = ref<Card[]>([]);

const deckId = computed(() => route.query.deckId as string);

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const username = computed(() => {
  const n = route.params.username;

  return Array.isArray(n) ? n[0] : n;
});

const {
  data: deck,
  pending,
  refresh: refreshData,
} = await useLazyFetch<DeckWithCards>(`/api/decks/${deckId.value}`, {
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(deck, () => (cards.value = getCards(false)), {
  immediate: true,
});

function getCards(ignoreDate: boolean) {
  if (!deck.value) return [];

  return ignoreDate
    ? deck.value.cards
    : deck.value.cards.filter(
        (c) => !c.nextReviewDate || Date.parse(c.nextReviewDate) < Date.now(),
      );
}

async function onIgnoreDate() {
  await refreshData();

  cards.value = getCards(true);
}
</script>

<template>
  <UContainer>
    <Flashcard
      :username="username"
      :deck="{ id: deckId, slug: deckSlug }"
      :cards="cards"
      :pending="pending"
      routing
      @restart="refreshData"
      @ignore-date="onIgnoreDate"
    >
      <template #header>
        <h1 class="mb-2 place-self-center text-lg font-semibold sm:text-xl">
          {{ deck?.name }}
        </h1>
      </template>
    </Flashcard>
  </UContainer>
</template>
