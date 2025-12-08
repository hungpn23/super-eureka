export const useDeck = () => {
  const { token } = useAuth();
  const route = useRoute();
  const toast = useToast();

  const deckId = computed(() => route.query.deckId as string);

  const deckSlug = computed(() => {
    const slug = route.params.slug;
    return Array.isArray(slug) ? slug[0] : slug;
  });

  const username = computed(() => {
    const n = route.params.username;
    return Array.isArray(n) ? n[0] : n;
  });

  const isIgnoreDate = useState<boolean>('is-ignore-date', () => false);

  const {
    data: deck,
    status,
    refresh,
    error,
  } = useLazyFetch<DeckWithCards>(() => `/api/decks/${deckId.value}`, {
    key: `deck-${deckId.value}`,
    headers: { Authorization: token.value || '' },
    server: false,
    watch: [deckId],
  });

  const cards = computed(() => {
    return getCards(deck.value?.cards || [], isIgnoreDate.value);
  });

  const isFetching = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );

  watch(deckId, (newId, oldId) => {
    if (newId !== oldId) {
      isIgnoreDate.value = false;
    }
  });

  watch(status, (newStatus) => {
    if (newStatus === 'error') {
      toast.add({
        title: 'Error fetching decks',
        description: JSON.stringify(error.value?.data || 'Unknown error'),
        color: 'error',
      });
    }
  });

  async function onIgnoreDate() {
    isIgnoreDate.value = true;
    await refresh();
  }

  async function onRestarted() {
    isIgnoreDate.value = false;
    await refresh();
  }

  return {
    deck,
    isFetching,
    status,
    refresh,
    error,
    isIgnoreDate,
    cards,
    deckId,
    deckSlug,
    username,
    onIgnoreDate,
    onRestarted,
  };
};
