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

  // --- State ---
  const isIgnoreDate = useState<boolean>('is-ignore-date', () => false);
  const isAnswersSaving = useState<boolean>('is-answers-saving', () => false);

  // Learn Session State
  const currentCard = ref<Card | undefined>(undefined);
  const knownCount = ref(0);
  const skippedCount = ref(0);
  const savedAnswers = ref<Answer[]>([]); // To communicate back to consumers

  const session = reactive<StudySession>({
    totalCards: 0,
    queue: [],
    answers: [],
    retryQueue: [],
  });

  // --- Fetching ---
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

  const progress = computed(() => {
    if (!session.totalCards) return 0;
    return (knownCount.value / session.totalCards) * 100;
  });

  // --- Watchers ---

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

  // Initialize Session
  watchImmediate(cards, (newCards) => {
    if (newCards && newCards.length > 0) {
      // Reset session
      knownCount.value = 0;
      skippedCount.value = 0;
      savedAnswers.value = [];

      session.answers = [];
      session.retryQueue = [];
      session.queue = [...newCards]; // Create a copy for the queue
      session.totalCards = session.queue.length;

      currentCard.value = session.queue.shift();
    } else {
      currentCard.value = undefined;
    }
  });

  // Auto-Save Logic
  watchDebounced(session, saveAnswers, {
    debounce: 1000,
    maxWait: 3000,
    deep: true,
  });

  // --- Actions ---
  async function onIgnoreDate() {
    isIgnoreDate.value = true;
    await refresh();
  }

  async function onRestarted() {
    const id = deckId.value;
    if (!id) return;

    $fetch(`/api/decks/restart/${id}`, {
      method: 'POST',
      headers: {
        Authorization: token.value || '',
      },
    })
      .then(async () => {
        isIgnoreDate.value = false;
        await refresh();
      })
      .catch((err: ErrorResponse) => {
        toast.add({
          title: 'Error restarting deck',
          description: JSON.stringify(err.data || 'Unknown error'),
          color: 'error',
        });
      });
  }

  function handleAnswer(correct: boolean) {
    if (!currentCard.value) return;

    isAnswersSaving.value = true;

    const updated = Object.assign({}, updateCard(currentCard.value, correct));

    if (correct) {
      knownCount.value++;
    } else {
      skippedCount.value++;
      session.retryQueue.push(updated);
    }

    // Update answers queue for saving
    const index = session.answers.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      session.answers[index] = updated;
    } else {
      session.answers.push(updated);
    }

    // Pick next card
    if (!session.queue.length) {
      if (!session.retryQueue.length) {
        currentCard.value = undefined;
        return;
      }

      session.queue = session.retryQueue;
      session.retryQueue = [];
    }

    currentCard.value = session.queue.shift();
    console.log(
      '🚀 ~ handleAnswer ~ currentCard.value:',
      currentCard.value?.term,
    );
  }

  async function saveAnswers() {
    const answersToSave = [...session.answers];
    if (answersToSave.length === 0) return;

    const id = deckId.value;

    $fetch(`/api/study/save-answer/${id}`, {
      method: 'POST',
      headers: { Authorization: token.value || '' },
      body: { answers: answersToSave },
    })
      .then(() => {
        savedAnswers.value = answersToSave; // Notify watchers
        session.answers = [];
      })
      .catch((err: ErrorResponse) => {
        console.error('Save answers fail!', err.data);
      })
      .finally(() => (isAnswersSaving.value = false));
  }

  return {
    // Data
    deck,
    cards,
    currentCard,
    savedAnswers, // Exposed for side effects (like updating form state)

    // State
    isFetching,
    status,
    error,
    isIgnoreDate,
    isAnswersSaving,

    // Stats
    progress,
    knownCount,
    skippedCount,
    totalCards: computed(() => session.totalCards),

    // Params
    deckId,
    deckSlug,
    username,

    // Actions
    refresh,
    onIgnoreDate,
    onRestarted,
    handleAnswer,
  };
};
