<script setup lang="ts">
const { token } = useAuth();
const route = useRoute();

const isIgnoreDate = ref(false);
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
  status,
  refresh,
} = useLazyFetch<DeckWithCards>(`/api/decks/${deckId.value}`, {
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(deck, (newDeck) => {
  cards.value = getCards(newDeck?.cards || [], isIgnoreDate.value);
});

async function onIgnoreDate() {
  isIgnoreDate.value = true;
  await refresh();
}

async function onRestarted() {
  isIgnoreDate.value = false;
  await refresh();
}
</script>

<template>
  <SkeletonFlashcardsPage v-if="status === 'idle' || status === 'pending'" />

  <UContainer v-else>
    <Flashcard
      :title="deck?.name"
      :deck="{ id: deckId, slug: deckSlug }"
      :cards
      @restarted="onRestarted"
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
