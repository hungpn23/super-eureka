import type { UUID } from "~/shared/types";
import type { CreateCardBody } from "~/valibot/schemas";

type CardSuggestion = CreateCardBody & {
	id: UUID;
};

export function useCardSuggestion() {
	const { token } = useAuth();
	let latestRequestId = 0;

	const suggestion = reactive({
		currentCardIndex: -1,
		cards: [] as CardSuggestion[],
	});

	function clearSuggestion() {
		suggestion.currentCardIndex = -1;
		suggestion.cards = [];
	}

	const suggestCards = useDebounceFn(
		async (card: CreateCardBody, cardIndex: number) => {
			const { term, definition, termLanguage, definitionLanguage } = card;

			if (!term || !definition) {
				clearSuggestion();
				return [];
			}

			const requestId = ++latestRequestId;

			try {
				const res = await $fetch<CardSuggestion[]>(
					"/api/suggestion/next-card",
					{
						method: "POST",
						headers: { Authorization: token.value || "" },
						body: {
							term,
							definition,
							termLanguage,
							definitionLanguage,
						},
					},
				);

				if (requestId !== latestRequestId) return [];

				clearSuggestion();
				suggestion.currentCardIndex = cardIndex;
				suggestion.cards = res;

				return res;
			} catch {
				if (requestId !== latestRequestId) return [];

				clearSuggestion();
				return [];
			}
		},
		500,
	);

	function isSuggestingThisCard(index: number) {
		return suggestion.currentCardIndex === index;
	}

	function hasCardSuggestion(index: number) {
		return isSuggestingThisCard(index) && suggestion.cards.length > 0;
	}

	return {
		suggestion,
		suggestCards,
		clearSuggestion,
		isSuggestingThisCard,
		hasCardSuggestion,
	};
}
