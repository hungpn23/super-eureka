import { CardSeparator } from "./enums";

export default (value: CardSeparator, custom: string = "") => {
  switch (value) {
    case CardSeparator.NEW_LINE:
      return "\n";
    case CardSeparator.SEMICOLON:
      return ";";
    case CardSeparator.CUSTOM:
      return custom;
    default:
      return null;
  }
};
