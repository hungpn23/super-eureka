import type { CreateCardBody, CreateDeckBody } from "~/valibot/schemas";
import { Visibility } from "../deck/enums";
import type {
  CardSeparator,
  ContentSeparator,
  CreateCardState,
  CreateDeckState,
} from "./types";

export const createCard = (): CreateCardBody => ({
  term: "",
  definition: "",
  termLanguage: "en",
  definitionLanguage: "vi",
});

export const buildCreateCardState = (
  card: Partial<CreateCardBody> = {},
): CreateCardState => ({
  tempId: crypto.randomUUID(),
  fileId: undefined,
  image: undefined,
  isUploading: false,
  ...createCard(),
  ...card,
});

export const buildCreateDeckBody = (
  state: CreateDeckState,
): CreateDeckBody => ({
  name: state.name,
  description: state.description,
  visibility: state.visibility,
  passcode: state.passcode,
  cards: state.cards.map((card) => ({
    term: card.term,
    termLanguage: card.termLanguage,
    definition: card.definition,
    definitionLanguage: card.definitionLanguage,
    pronunciation: card.pronunciation,
    partOfSpeech: card.partOfSpeech,
    usageOrGrammar: card.usageOrGrammar,
    examples: card.examples,
    ...(card.fileId ? { fileId: card.fileId } : {}),
  })),
});

export const getVisibilityDesc = (visibility: Visibility) => {
  const desc: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "All other users can use this set",
    [Visibility.PROTECTED]: "Only people with this passcode can use this set",
    [Visibility.PRIVATE]: "Only you can view this set",
  };

  return desc[visibility];
};

export const getVisibilityLabel = (visibility: Visibility) => {
  const label: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "Everyone",
    [Visibility.PROTECTED]: "People with a passcode",
    [Visibility.PRIVATE]: "Just me",
  };

  return label[visibility];
};

export const getContentSeparator = (
  value: ContentSeparator,
  custom: string = "",
) => {
  switch (value) {
    case "comma":
      return ",";
    case "tab":
      return "\t";
    case "custom":
      return custom;
    default:
      return null;
  }
};

export const getCardSeparator = (value: CardSeparator, custom: string = "") => {
  switch (value) {
    case "new_line":
      return "\n";
    case "semicolon":
      return ";";
    case "custom":
      return custom;
    default:
      return null;
  }
};
