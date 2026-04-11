import type { ShallowRef } from "vue";
import type { ContentSuggestion } from "~/features/card";
import { focusInput } from "~/shared/utils";
import type { CreateCardBody } from "~/valibot/schemas";
import type { TextareaRef } from "../types";

export function useContentSuggestion(
  definitionRefs: Readonly<ShallowRef<TextareaRef[] | null>>,
) {
  const { token } = useAuth();
  let latestRequestId = 0;

  const suggestion = reactive<ContentSuggestion>({
    currentCardIndex: -1,
    definition: "",
  });

  function clearSuggestion() {
    suggestion.currentCardIndex = -1;
    suggestion.definition = "";
    suggestion.pronunciation = undefined;
    suggestion.partOfSpeech = undefined;
    suggestion.usageOrGrammar = undefined;
    suggestion.examples = undefined;
  }

  const suggestContent = useDebounceFn(
    async (card: CreateCardBody, cardIndex: number) => {
      const { term, partOfSpeech, termLanguage, definitionLanguage } = card;
      if (!term) return;

      const requestId = ++latestRequestId;

      try {
        const res = await $fetch<ContentSuggestion>("/api/suggestion/content", {
          method: "POST",
          headers: { Authorization: token.value || "" },
          body: {
            term,
            partOfSpeech,
            termLanguage,
            definitionLanguage,
          },
        });

        if (requestId !== latestRequestId) return;

        clearSuggestion();
        Object.assign(suggestion, res);
        suggestion.currentCardIndex = cardIndex;
      } catch {
        if (requestId !== latestRequestId) return;
        clearSuggestion();
      }
    },
    500,
  );

  function isSuggestingThisCard(index: number) {
    return suggestion.currentCardIndex === index;
  }

  function hasContentSuggestion(card: CreateCardBody) {
    return !card.definition && !!suggestion.definition;
  }

  function applyContentSuggestion(card: CreateCardBody, index: number) {
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
