import { Visibility } from "../deck";
import type {
  CardSeparator,
  ContentSeparator,
  CreateCardSchema,
} from "./types";

export const getNewCard = (): CreateCardSchema => ({
  term: "",
  definition: "",
  termLanguage: "en",
  definitionLanguage: "vi",
  examples: [],
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
