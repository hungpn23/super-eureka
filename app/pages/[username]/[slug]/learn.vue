<script setup lang="ts">
const { token, data: user } = useAuth();
const route = useRoute();

const progress = ref(33);
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

// Options for the current flashcard (mock data for now)
const options = [
  { id: 1, text: 'aliquip', key: '1' },
  { id: 2, text: 'duis fugiat nisi', key: '2' },
  {
    id: 3,
    text: 'id velit dolor culpa est tempor duis veniam magna amet',
    key: '3',
  },
  {
    id: 4,
    text: 'cupidatat pariatur incididunt fugiat anim cupidatat pariatur incididunt fugiat anim quis elit dolor sit elit magna officia sit pariatur eu',
    key: '4',
  },
];
</script>

<template>
  <ClientOnly>
    <UContainer>
      <div class="mb-8 flex w-full flex-col gap-2">
        <div class="flex place-content-between place-items-center gap-2">
          <UButton
            :to="`/${username}/${deckSlug}/flashcards?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            icon="i-lucide-move-left"
            label="Back to Flashcards"
          />

          <UButton
            :to="`/${username}/${deckSlug}/test?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            trailing-icon="i-lucide-move-right"
            label="Go to Test"
          />
        </div>

        <h1 class="mb-2 place-self-center text-lg font-semibold sm:text-xl">
          Some title and stuff of course
        </h1>

        <div class="flex place-content-between">
          <div class="flex place-items-center gap-2">
            <UBadge
              label="42"
              class="rounded-full px-2"
              variant="subtle"
              color="error"
            />

            <span class="text-error text-sm">Incorrect</span>
          </div>

          <div>12 / 53</div>

          <div class="flex place-items-center gap-2">
            <span class="text-success text-sm">Correct</span>

            <UBadge
              label="12"
              class="rounded-full px-2"
              variant="subtle"
              color="success"
            />
          </div>
        </div>

        <UProgress
          v-model="progress"
          :ui="{ base: 'bg-inherit' }"
          class="ring-default rounded-lg shadow ring"
        />

        <!-- class="md:ring-default flex min-h-[50dvh] flex-col place-content-between place-items-start gap-2 bg-inherit md:rounded-lg md:p-4 md:shadow-md md:ring" -->
        <UCard
          :ui="{
            body: 'p-2 sm:p-4 w-full flex flex-col gap-2 sm:gap-4 place-content-between',
          }"
          class="flex min-h-[50dvh] shadow-md"
        >
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-semibold">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
              />
              Term
            </span>

            <UButton
              class="cursor-pointer"
              icon="i-lucide-lightbulb"
              variant="ghost"
              color="neutral"
            >
              Get a hint
            </UButton>
          </div>

          <div class="text-xl font-medium sm:text-2xl">
            Ability to understand spoken words, sentences, and conversations.
            Ability to understand spoken words, sentences, and conversations.
            Ability to understand spoken words, sentences, and conversations.
            Ability to understand spoken words, sentences, and conversations.
          </div>

          <div class="mt-4 flex w-full flex-col gap-2 sm:gap-4">
            <div class="flex place-items-center gap-2">
              <span class="font-bold">Choose your answer</span>

              <UBadge
                label="Let's try again"
                color="warning"
                class="capitalize"
                variant="subtle"
              />
            </div>

            <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
              <UButton
                v-for="(opt, index) in options"
                :key="opt.id"
                variant="outline"
                color="neutral"
                class="flex w-full cursor-pointer place-items-center gap-2 rounded-lg p-3 transition-all hover:scale-102 hover:shadow active:scale-95"
              >
                <UBadge
                  class="hidden h-8 w-8 shrink-0 place-content-center place-items-center rounded-full bg-inherit font-bold sm:flex"
                  variant="outline"
                  color="neutral"
                >
                  {{ index + 1 }}
                </UBadge>

                <span class="text-start text-lg font-medium">
                  {{ opt.text }}
                </span>
              </UButton>
            </div>

            <UButton
              class="cursor-pointer place-self-end font-medium"
              variant="ghost"
            >
              Don't know?
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>
  </ClientOnly>
</template>
