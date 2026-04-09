import type { ShallowRef } from "vue";
import { focusInput } from "~/shared/utils";
import type { CreateDeckCardFormState, TextareaRef } from "../types";
import { useCardSuggestion } from "./useCardSuggestion";
import { useContentSuggestion } from "./useContentSuggestion";

type CreateDeckCard = CreateDeckCardFormState;

export function useCardsEditorSuggestions(
	cards: Readonly<ShallowRef<CreateDeckCard[]>>,
	termRefs: Readonly<ShallowRef<TextareaRef[] | null>>,
	definitionRefs: Readonly<ShallowRef<TextareaRef[] | null>>,
) {
	const {
		suggestion,
		suggestContent,
		isSuggestingThisCard,
		hasContentSuggestion,
		isWord,
	} = useContentSuggestion(definitionRefs);

	const {
		suggestion: cardSuggestion,
		suggestCards,
		hasCardSuggestion,
	} = useCardSuggestion();

	function handleAddExample(index: number) {
		const card = cards.value?.[index];
		if (!card) return;

		if (!card.examples) {
			card.examples = [""];
			return;
		}

		card.examples.push("");
	}

	function handleTermChange(card: CreateDeckCard, index: number) {
		suggestContent(card, index);
		suggestCards(card, index);
	}

	function handleDefinitionChange(card: CreateDeckCard, index: number) {
		suggestCards(card, index);
	}

	function isEmptyCard(card: CreateDeckCard) {
		return (
			!card.term &&
			!card.definition &&
			!card.pronunciation &&
			!card.partOfSpeech &&
			!card.usageOrGrammar &&
			!card.examples?.length
		);
	}

	function getSuggestedCard(card: CreateDeckCard, index: number) {
		if (
			!hasCardSuggestion(cardSuggestion.currentCardIndex) ||
			!isEmptyCard(card)
		) {
			return undefined;
		}

		const sourceIndex = cardSuggestion.currentCardIndex;
		if (index <= sourceIndex) return undefined;

		return cardSuggestion.cards[index - sourceIndex - 1];
	}

	function hasSuggestedCard(card: CreateDeckCard, index: number) {
		return !!getSuggestedCard(card, index);
	}

	function applyCardSuggestion(card: CreateDeckCard, index: number) {
		const nextCard = getSuggestedCard(card, index);
		if (!nextCard) return false;

		const { id: _id, ...suggestedCard } = nextCard;
		Object.assign(card, suggestedCard);
		return true;
	}

	function blurTermInput(index: number) {
		termRefs.value?.[index]?.textareaRef?.blur();
	}

	function applyContentSuggestionWithoutFocus(
		card: CreateDeckCard,
		index: number,
	) {
		if (!hasContentSuggestion(card) || !isSuggestingThisCard(index))
			return false;

		const { currentCardIndex: _currentCardIndex, ...contentSuggestion } =
			suggestion;
		Object.assign(card, contentSuggestion);
		return true;
	}

	function getNextSuggestedCardIndex(index: number) {
		for (
			let nextIndex = index + 1;
			nextIndex < cards.value.length;
			nextIndex++
		) {
			const nextCard = cards.value[nextIndex];
			if (nextCard && hasSuggestedCard(nextCard, nextIndex)) {
				return nextIndex;
			}
		}

		return -1;
	}

	function focusNextTermInput(index: number) {
		const nextIndex = index + 1;
		const nextTermRef = termRefs.value?.[nextIndex]?.textareaRef;

		if (nextTermRef) {
			focusInput(nextTermRef);
			return true;
		}

		return false;
	}

	function handleTermTab(
		event: KeyboardEvent,
		card: CreateDeckCard,
		index: number,
	) {
		if (applyContentSuggestionWithoutFocus(card, index)) {
			event.preventDefault();
			suggestCards(card, index);
			if (!focusNextTermInput(index)) {
				blurTermInput(index);
			}
			return;
		}

		if (cardSuggestion.currentCardIndex === index) {
			const nextSuggestedCardIndex = getNextSuggestedCardIndex(index);

			if (nextSuggestedCardIndex >= 0) {
				event.preventDefault();
				focusInput(termRefs.value?.[nextSuggestedCardIndex]?.textareaRef);
				return;
			}
		}

		if (applyCardSuggestion(card, index)) {
			event.preventDefault();
			suggestCards(card, index);
			if (!focusNextTermInput(index)) {
				blurTermInput(index);
			}
		}
	}

	function getTermPlaceholder(card: CreateDeckCard, index: number) {
		return getSuggestedCard(card, index)?.term || "Enter your term...";
	}

	function getDefinitionPlaceholder(card: CreateDeckCard, index: number) {
		return (
			getSuggestedCard(card, index)?.definition ||
			(isSuggestingThisCard(index) ? suggestion.definition : undefined) ||
			"Enter your definition..."
		);
	}

	function getPartOfSpeechPlaceholder(card: CreateDeckCard, index: number) {
		return (
			getSuggestedCard(card, index)?.partOfSpeech ||
			(isSuggestingThisCard(index) ? suggestion.partOfSpeech : undefined) ||
			"eg. noun"
		);
	}

	function getPronunciationPlaceholder(card: CreateDeckCard, index: number) {
		return (
			getSuggestedCard(card, index)?.pronunciation ||
			(isSuggestingThisCard(index) ? suggestion.pronunciation : undefined) ||
			"eg. /heˈloʊ/"
		);
	}

	function getUsageOrGrammarPlaceholder(card: CreateDeckCard, index: number) {
		return (
			getSuggestedCard(card, index)?.usageOrGrammar ||
			(isSuggestingThisCard(index) ? suggestion.usageOrGrammar : undefined) ||
			"Enter your usage or grammar notes"
		);
	}

	function getRenderableExampleCount(card: CreateDeckCard, index: number) {
		const exampleCount = card.examples?.length ?? 0;
		if (exampleCount > 0) return exampleCount;

		const suggestedCardCount = getSuggestedCard(card, index)?.examples?.length;
		if (suggestedCardCount) return suggestedCardCount;

		if (isSuggestingThisCard(index) && suggestion.examples?.length) {
			return suggestion.examples.length;
		}

		return 0;
	}

	function handleExampleInput(
		card: CreateDeckCard,
		cardIndex: number,
		exampleIndex: number,
		value: string,
	) {
		if (!card.examples?.length) {
			const suggestionExampleCount =
				getSuggestedCard(card, cardIndex)?.examples?.length ||
				(isSuggestingThisCard(cardIndex)
					? (suggestion.examples?.length ?? 0)
					: 0);

			card.examples = Array.from(
				{ length: Math.max(suggestionExampleCount, exampleIndex + 1, 1) },
				() => "",
			);
		}

		card.examples[exampleIndex] = value;
	}

	function getExamplePlaceholder(
		card: CreateDeckCard,
		index: number,
		exampleIndex: number,
	) {
		return (
			getSuggestedCard(card, index)?.examples?.[exampleIndex] ||
			(isSuggestingThisCard(index)
				? suggestion.examples?.[exampleIndex]
				: undefined) ||
			"eg. Hello, how are you?"
		);
	}

	function shouldShowAcceptSuggestion(card: CreateDeckCard, index: number) {
		return (
			(isSuggestingThisCard(index) && hasContentSuggestion(card)) ||
			hasSuggestedCard(card, index)
		);
	}

	return {
		handleAddExample,
		handleDefinitionChange,
		handleExampleInput,
		handleTermChange,
		handleTermTab,
		getDefinitionPlaceholder,
		getExamplePlaceholder,
		getPartOfSpeechPlaceholder,
		getPronunciationPlaceholder,
		getRenderableExampleCount,
		getTermPlaceholder,
		getUsageOrGrammarPlaceholder,
		isWord,
		shouldShowAcceptSuggestion,
	};
}
