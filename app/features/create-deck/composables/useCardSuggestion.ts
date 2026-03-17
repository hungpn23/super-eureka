import type { ShallowRef } from "vue";
import type { CardSuggestion } from "~/features/card";
import { focusInput } from "~/shared/utils";
import type { CreateCardSchema } from "~/valibot/schemas";
import type { TextareaRef } from "../types";

export function useCardSuggestion(
  definitionRef: Readonly<ShallowRef<TextareaRef[] | null>>,
) {
  const { token } = useAuth();

  const suggestion = reactive<CardSuggestion>({
    currentCardIndex: -1,
    definition: "",
  });

  const debouncedGetCardSuggestion = useDebounceFn(
    async (card: CreateCardSchema, cardIndex: number) => {
      const { term, partOfSpeech, termLanguage, definitionLanguage } = card;

      $fetch<CardSuggestion>("/api/suggestion/term", {
        method: "POST",
        headers: { Authorization: token.value || "" },
        body: {
          term,
          partOfSpeech,
          termLanguage,
          definitionLanguage,
        },
      })
        .then((res) => {
          Object.assign(suggestion, res);
          suggestion.currentCardIndex = cardIndex;
        })
        .catch(() => {});
    },
    500,
  );

  function isSuggestingThisCard(index: number) {
    return suggestion.currentCardIndex === index;
  }

  function hasSuggestion(card: CreateCardSchema) {
    return !card.definition && !!suggestion.definition;
  }

  function applySuggestion(card: CreateCardSchema, index: number) {
    if (!hasSuggestion(card)) return;
    Object.assign(card, suggestion);
    focusInput(definitionRef.value?.[index]?.textareaRef);
  }

  function isWord(term: string) {
    return !term.trim().includes(" ");
  }

  return {
    suggestion,
    debouncedGetCardSuggestion,
    isSuggestingThisCard,
    hasSuggestion,
    applySuggestion,
    isWord,
  };
}
