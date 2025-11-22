<script setup lang="ts">
const { token, data: user } = useAuth();
const route = useRoute();

const cards = ref<Card[]>([]);

const deckId = computed(() => route.query.deckId as string);

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
      :username="user?.username"
      :deck="{ id: deckId, slug: deck?.slug }"
      :cards="cards"
      :pending="pending"
      @refresh-data="refreshData"
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
