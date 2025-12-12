import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDeckStore = defineStore('deck', () => {
  // --- Composables ---
  const route = useRoute();
  const { token, data: user } = useAuth();
  const toast = useToast();

  // --- State ---
  const isIgnoreDate = ref(false);

  // --- Getters ---
  const deckId = computed(() => route.query.deckId as string | undefined);

  const slug = computed(() => {
    const s = route.params.slug;
    return Array.isArray(s) ? s[0] : s;
  });

  const username = computed(() => {
    const n = route.params.username;
    return Array.isArray(n) ? n[0] : n;
  });

  const isOwner = computed(() => {
    return user.value?.username === username.value;
  });

  // --- Define fetch composable ---
  const {
    data: deck,
    status,
    error,
    refresh: refetch,
    execute,
  } = useLazyFetch<DeckWithCards, ErrorResponse>(
    () => `/api/decks/${deckId.value}`,
    {
      headers: { Authorization: token.value || '' },
      server: false,
      immediate: false,
      watch: false, // handled manually
    },
  );

  // --- Watchers ---
  watchImmediate(
    () => route.fullPath,
    async () => await execute(),
  );

  watch(status, () => {
    if (status.value === 'error') {
      toast.add({
        title: 'Error fetching deck.',
        description: JSON.stringify(
          error.value?.data?.message || 'Unknown error.',
        ),
        color: 'error',
      });
    }
  });

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

  return {
    // State
    deck: computed(() => deck.value),
    status: computed(() => status.value),
    isIgnoreDate: computed(() => isIgnoreDate.value),

    // Getters
    deckId,
    slug,
    username,
    isOwner,

    // Actions
    refetch,
    restartDeck,
    updateIgnoreDate,
  };
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
