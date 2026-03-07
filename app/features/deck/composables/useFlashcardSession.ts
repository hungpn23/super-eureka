import type { FlashcardSession } from "~/features/card";
import { api as studyApi, useStudyToasts } from "~/features/study";
import { getCards } from "~/shared/utils";
import { DEFAULT_FLASHCARD_SESSION } from "../constants";
import { shuffleArray, updateCard } from "../utils";

export const useFlashcardSession = () => {
	const { token } = useAuth();
	const toast = useStudyToasts();
	const store = useDeckStore();

	const flashcardSession = reactive<FlashcardSession>(
		DEFAULT_FLASHCARD_SESSION,
	);
	const cards = computed(() =>
		getCards(store.deck?.cards || [], store.isIgnoreDate),
	);
	const studyProgress = computed(
		() => (flashcardSession.knownCount / flashcardSession.totalCards) * 100,
	);

	const {
		status,
		pending: isSavingAnswers,
		execute: saveAnswers,
	} = studyApi.saveAnswers({
		deckId: store.deckId,
		token,
		cardsToSave: flashcardSession.cardsToSave,
	});

	watch(
		() => flashcardSession.currentCard?.id,
		() => {
			flashcardSession.isCardFlipped = false;
		},
	);

	watchImmediate(cards, () => {
		if (cards.value && cards.value.length > 0) {
			Object.assign(flashcardSession, DEFAULT_FLASHCARD_SESSION);
			flashcardSession.studyQueue = cards.value;
			flashcardSession.totalCards = flashcardSession.studyQueue.length;
			flashcardSession.currentCard = flashcardSession.studyQueue.shift();
		}
	});

	watchDebounced(() => flashcardSession.cardsToSave, handleSaveAnswers, {
		debounce: 1000,
		deep: true,
	});

	const handleFlipCard = useThrottleFn(() => {
		flashcardSession.isCardFlipped = !flashcardSession.isCardFlipped;
	}, 300);

	const handleAnswer = useThrottleFn(async (isCorrect: boolean) => {
		if (!flashcardSession.currentCard) return;

		const updated = updateCard(flashcardSession.currentCard, isCorrect);

		if (isCorrect) {
			flashcardSession.knownCount++;
		} else {
			flashcardSession.skippedCount++;
			flashcardSession.retryQueue.push(updated);
		}

		// Update cardsToSave queue for saving
		const index = flashcardSession.cardsToSave.findIndex(
			(a) => a.id === updated.id,
		);
		if (index !== -1) {
			flashcardSession.cardsToSave[index] = updated;
		} else {
			flashcardSession.cardsToSave.push(updated);
		}

		// Pick next card
		if (!flashcardSession.studyQueue.length) {
			if (!flashcardSession.retryQueue.length) {
				if (store.isIgnoreDate)
					await Promise.all([handleSaveAnswers(), store.fetchDeck()]);

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

	async function handleSaveAnswers() {
		if (flashcardSession.cardsToSave.length > 0) {
			await saveAnswers();
		}

		if (status.value === "success") {
			flashcardSession.savedCards = flashcardSession.cardsToSave;
			flashcardSession.cardsToSave = [];
		}

		if (status.value === "error") {
			toast.saveAnswersFailed();
		}
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
