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

  const session = reactive<StudySession>({
    currentCard: undefined,
    queue: [],
    answers: [],
    savedAnswers: [],
    retryQueue: [],
    totalCards: 0,
    knownCount: 0,
    skippedCount: 0,
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

  const progress = computed(() => {
    if (!session.totalCards) return 0;
    return (session.knownCount / session.totalCards) * 100;
  });

  // --- Watchers ---
  watch(deckId, (newId, oldId) => {
    if (newId !== oldId) isIgnoreDate.value = false;
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
      session.knownCount = 0;
      session.skippedCount = 0;
      session.savedAnswers = [];

      session.answers = [];
      session.retryQueue = [];
      session.queue = structuredClone(newCards); // Create a copy for the queue
      session.totalCards = session.queue.length;

      session.currentCard = session.queue.shift();
    } else {
      session.currentCard = undefined;
    }
  });

  // Auto-save
  watchDebounced(
    () => session.answers,
    async () => await saveAnswers(),
    { debounce: 1000, deep: true },
  );

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

  function handleAnswer(isCorrect: boolean) {
    if (!session.currentCard) return;

    isAnswersSaving.value = true;

    const updated = updateCard(session.currentCard, isCorrect);

    if (isCorrect) {
      session.knownCount++;
    } else {
      session.skippedCount++;
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
        session.currentCard = undefined;
        return;
      }

      session.queue = session.retryQueue;
      session.retryQueue = [];
    }

    session.currentCard = session.queue.shift();
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
        session.savedAnswers = answersToSave; // Notify watchers
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
    session: computed(() => session),

    // State
    status,
    error,
    isIgnoreDate,
    isAnswersSaving,

    // Stats
    progress,

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
