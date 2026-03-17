import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  CreateCardSchema,
  CreateDeckSchema,
  ImportCardsSchema,
} from "~/valibot/schemas";
import type { CardSeparator, ContentSeparator } from "../types";
import { getCardSeparator, getContentSeparator } from "../utils";

export function useCardsImport(createState: CreateDeckSchema) {
  const toast = useToast();

  const isImportModalOpen = ref(false);

  const importState = reactive({
    input: "",
    contentSeparator: "tab" as ContentSeparator,
    cardSeparator: "new_line" as CardSeparator,
    customContentSeparator: "-",
    customCardSeparator: "\\",
  });

  const contentSeparatorPreview = computed(
    () =>
      `Term${getContentSeparator(
        importState.contentSeparator,
        importState.customContentSeparator,
      )}Definition`,
  );

  const cardSeparatorPreview = computed(
    () =>
      `Card1${getCardSeparator(
        importState.cardSeparator,
        importState.customCardSeparator,
      )}Card2`,
  );

  const parsedCards = computed(() => {
    const sep = getContentSeparator(
      importState.contentSeparator,
      importState.customContentSeparator,
    );
    const cardSep = getCardSeparator(
      importState.cardSeparator,
      importState.customCardSeparator,
    );

    if (!importState.input || !sep || !cardSep) return [];

    const cards = importState.input
      .split(cardSep)
      .filter((card) => card.trim().length);

    return cards.map((card) => {
      const [term, definition] = card
        .split(sep)
        .filter((part) => part.trim().length)
        .map((part) => part.trim());

      return { term: term || "", definition: definition || "" };
    });
  });

  async function onImportSubmit(event: FormSubmitEvent<ImportCardsSchema>) {
    const sep = getContentSeparator(
      importState.contentSeparator,
      importState.customContentSeparator,
    );

    const cardSep = getCardSeparator(
      importState.cardSeparator,
      importState.customCardSeparator,
    );

    if (!sep || !cardSep) return;

    const importCards = event.data.input
      .split(cardSep)
      .filter((card) => card.trim().length)
      .map((card) => {
        const [term, definition] = card
          .split(sep)
          .filter((part) => part.trim().length)
          .map((part) => part.trim());

        const newCard: CreateCardSchema = {
          term: term || "",
          definition: definition || "",
          termLanguage: "en",
          definitionLanguage: "vi",
        };

        return newCard;
      });

    const currentCards = createState.cards.filter(
      (c) => c.term.trim().length > 0 || c.definition.trim().length > 0,
    );

    createState.cards = [...currentCards, ...importCards];

    isImportModalOpen.value = false;

    toast.add({ title: "Successfully imported!", color: "success" });
  }

  return {
    isImportModalOpen,
    importState,
    contentSeparatorPreview,
    cardSeparatorPreview,
    parsedCards,
    onImportSubmit,
  };
}
