import { scheduleCardReview } from "~/features/deck";
import { getCards, shuffleArray } from "~/shared/utils";
import { api } from "../../api";
import type { FlashcardSession, LearnAnswerStatus } from "../../types";
import { getDefaultFlashcardSession, useStudyToasts } from "../common";

export const useFlashcardStudy = () => {
  const { token } = useAuth();
  const toast = useStudyToasts();
  const store = useDeckStore();

  const flashcardSession = reactive<FlashcardSession>(
    getDefaultFlashcardSession(),
  );
  const cards = computed(() => getCards(store.deck?.cards || []));
  const studyProgress = computed(
    () => (flashcardSession.knownCount / flashcardSession.totalCards) * 100,
  );

  const { status, pending: isSavingAnswers } = api.saveAnswers({
    deckId: store.deckId,
    token,
    session: flashcardSession,
  });

  watch(
    () => flashcardSession.currentCard?.id,
    () => {
      flashcardSession.isCardFlipped = false;
    },
  );

  watchImmediate(cards, () => {
    if (cards.value && cards.value.length > 0) {
      Object.assign(flashcardSession, getDefaultFlashcardSession());
      flashcardSession.studyQueue = cards.value;
      flashcardSession.totalCards = flashcardSession.studyQueue.length;
      flashcardSession.currentCard = flashcardSession.studyQueue.shift();
    }
  });

  watch(status, () => {
    if (status.value === "error") toast.saveAnswersFailed();
  });

  const handleFlipCard = useThrottleFn(() => {
    flashcardSession.isCardFlipped = !flashcardSession.isCardFlipped;
  }, 300);

  const handleAnswer = useThrottleFn(async (status: LearnAnswerStatus) => {
    if (!flashcardSession.currentCard) return;

    const updatedCard = scheduleCardReview(
      flashcardSession.currentCard,
      status,
    );

    if (status === "correct") {
      flashcardSession.knownCount++;
    } else {
      flashcardSession.skippedCount++;
      flashcardSession.retryQueue.push(updatedCard);
    }

    // Update cardsToSave queue for saving
    const index = flashcardSession.cardsToSave.findIndex(
      (a) => a.id === updatedCard.id,
    );
    if (index === -1) {
      flashcardSession.cardsToSave.push(updatedCard);
    } else {
      flashcardSession.cardsToSave[index] = updatedCard;
    }

    // Pick next card
    if (!flashcardSession.studyQueue.length) {
      if (!flashcardSession.retryQueue.length) {
        flashcardSession.currentCard = undefined;
        return;
      }

      flashcardSession.studyQueue = flashcardSession.retryQueue;
      flashcardSession.retryQueue = [];
    }

    flashcardSession.currentCard = flashcardSession.studyQueue.shift();
  }, 300);

  function handleShuffleCards() {
    if (!flashcardSession.currentCard) return;

    flashcardSession.studyQueue = shuffleArray(flashcardSession.studyQueue);
    flashcardSession.retryQueue = shuffleArray(flashcardSession.retryQueue);

    flashcardSession.studyQueue.push(flashcardSession.currentCard);
    flashcardSession.currentCard = flashcardSession.studyQueue.shift();
  }

  return {
    isSavingAnswers,
    flashcardSession,
    studyProgress,
    handleFlipCard,
    handleAnswer,
    handleShuffleCards,
  };
};
