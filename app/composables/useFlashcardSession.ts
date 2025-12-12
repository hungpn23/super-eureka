export const useFlashcardSession = () => {
  const { token } = useAuth();
  const store = useDeckStore();

  const isSavingCards = useState('is-saving-cards', () => false);

  const session = reactive<FlashcardSession>({
    currentCard: null,
    cardsToSave: [],
    savedCards: [],
    studyQueue: [],
    retryQueue: [],
    totalCards: 0,
    knownCount: 0,
    skippedCount: 0,
  });

  const cards = computed(() =>
    getCards(store.deck?.cards || [], store.isIgnoreDate),
  );

  const progress = computed(() => {
    if (!session.totalCards) return 0;
    return (session.knownCount / session.totalCards) * 100;
  });

  // Initialize session
  watchImmediate(cards, (newCards) => {
    if (newCards && newCards.length > 0) resetSession(newCards);
  });

  // Auto-save
  watchDebounced(
    () => session.cardsToSave,
    async () => await saveCards(),
    { debounce: 1000, deep: true },
  );

  function resetSession(cards: Card[]) {
    session.knownCount = 0;
    session.skippedCount = 0;
    session.savedCards = [];
    session.cardsToSave = [];
    session.retryQueue = [];
    session.studyQueue = cards;
    session.totalCards = session.studyQueue.length;
    session.currentCard = session.studyQueue.shift();
  }

  async function handleAnswer(isCorrect: boolean) {
    if (!session.currentCard) return;

    isSavingCards.value = true;

    const updated = updateCard(session.currentCard, isCorrect);

    if (isCorrect) {
      session.knownCount++;
    } else {
      session.skippedCount++;
      session.retryQueue.push(updated);
    }

    // Update cardsToSave queue for saving
    const index = session.cardsToSave.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      session.cardsToSave[index] = updated;
    } else {
      session.cardsToSave.push(updated);
    }

    // Pick next card
    if (!session.studyQueue.length) {
      if (!session.retryQueue.length) {
        if (store.isIgnoreDate)
          await Promise.all([saveCards(), store.refetch()]);

        session.currentCard = undefined;
        return;
      }

      session.studyQueue = session.retryQueue;
      session.retryQueue = [];
    }

    session.currentCard = session.studyQueue.shift();
  }

  async function saveCards() {
    const cardsToSave = [...session.cardsToSave];
    if (cardsToSave.length === 0) return;

    $fetch(`/api/study/save-answer/${store.deckId}`, {
      method: 'POST',
      headers: { Authorization: token.value || '' },
      body: { answers: cardsToSave },
    })
      .then(() => {
        session.savedCards = cardsToSave; // trigger watcher in consumer
        session.cardsToSave = [];
      })
      .catch((err: ErrorResponse) =>
        console.error('Save cardsToSave fail!', err.data),
      )
      .finally(() => (isSavingCards.value = false));
  }

  return {
    isSavingCards,
    session,
    progress,
    handleAnswer,
  };
};
