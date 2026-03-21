import type { ShallowRef } from "vue";
import type { ContentSuggestion } from "~/features/card";
import { focusInput } from "~/shared/utils";
import type { CreateCardSchema } from "~/valibot/schemas";
import type { TextareaRef } from "../types";

export function useContentSuggestion(
  definitionRefs: Readonly<ShallowRef<TextareaRef[] | null>>,
) {
  const { token } = useAuth();

  const suggestion = reactive<ContentSuggestion>({
    currentCardIndex: -1,
    definition: "",
  });

  const suggestContent = useDebounceFn(
    async (card: CreateCardSchema, cardIndex: number) => {
      const { term, partOfSpeech, termLanguage, definitionLanguage } = card;

      $fetch<ContentSuggestion>("/api/suggestion/content", {
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

  function hasContentSuggestion(card: CreateCardSchema) {
    return !card.definition && !!suggestion.definition;
  }

  function applyContentSuggestion(card: CreateCardSchema, index: number) {
    if (!hasContentSuggestion(card)) return;
    Object.assign(card, suggestion);
    focusInput(definitionRefs.value?.[index]?.textareaRef);
  }

  function isWord(term: string) {
    return !term.trim().includes(" ");
  }

  return {
    suggestion,
    suggestContent,
    isSuggestingThisCard,
    hasContentSuggestion,
    applyContentSuggestion,
    isWord,
  };
}
