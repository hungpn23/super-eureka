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
        (c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
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
      :cards="cards"
      :pending="pending"
      :title="deck?.name"
      :deck="{ id: deckId, slug: deckSlug }"
      routing
      @restarted="refreshData"
      @ignore-date="onIgnoreDate"
    >
      <template #routes>
        <div class="flex place-content-between place-items-center gap-2">
          <UButton
            :to="`/${username}/${deckSlug}?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            icon="i-lucide-move-left"
            label="Go back"
          />

          <UButton
            :to="`/${username}/${deckSlug}/learn?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            trailing-icon="i-lucide-move-right"
            label="Go to Learn"
          />
        </div>
      </template>
    </Flashcard>
  </UContainer>
</template>
