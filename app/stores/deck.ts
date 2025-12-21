import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDeckStore = defineStore('deck', () => {
  // --- Composables ---
  const route = useRoute();
  const { token } = useAuth();
  const toast = useToast();

  // --- State ---
  const isIgnoreDate = ref(false);
  const deckId = ref<string>('');
  const slug = ref<string>('');

  // --- Define fetch composable ---
  const {
    data: deck,
    status,
    refresh: refetch,
    execute,
  } = useLazyFetch<DeckWithCards, ErrorResponse>(
    () => `/api/decks/${deckId.value}`,
    {
      headers: { Authorization: token.value || '' },
      server: false,
      immediate: false,
      watch: false, // handled manually

      onResponseError: ({ response }) => {
        if (response.status === 404) {
          showError({
            statusCode: 404,
            message: 'Deck not found.',
          });
        }
      },
    },
  );

  // --- Watchers ---
  watchImmediate(
    () => route.name,
    async (newName) => {
      const newNameStr = newName?.toString() || '';

      if (newNameStr.includes('library-slug')) {
        deckId.value = route.query.deckId as string;
        slug.value = route.params.slug as string;

        await execute();
      }
    },
  );

  // --- Actions ---
  async function restartDeck() {
    if (!deckId.value) return;

    await $fetch(`/api/decks/restart/${deckId.value}`, {
      method: 'POST',
      headers: { Authorization: token.value || '' },
    })
      .then(async () => {
        await refetch();

        toast.add({
          title: 'Progress restarted.',
          description: 'You can now start learning from scratch.',
          color: 'success',
        });
      })
      .catch((err: ErrorResponse) => {
        toast.add({
          title: 'Error restarting deck.',
          description: JSON.stringify(err.data?.message || 'Unknown error.'),
          color: 'error',
        });
      });
  }

  function updateIgnoreDate(checked: boolean) {
    isIgnoreDate.value = checked;
  }

  function toggleIgnoreDate() {
    isIgnoreDate.value = !isIgnoreDate.value;
  }

  return {
    // State
    deck: computed(() => deck.value),
    status: computed(() => status.value),
    isIgnoreDate: computed(() => isIgnoreDate.value),

    // Getters
    deckId,
    slug,

    // Actions
    refetch,
    restartDeck,
    updateIgnoreDate,
    toggleIgnoreDate,
  };
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
