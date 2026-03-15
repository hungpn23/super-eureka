import type { TokenDiff, WrittenAnswerType } from "../../types";
import { getCharacterDifferences } from "./getCharacterDifferences";
import { getWordDifferences } from "./getWordDifferences";
import { resolveWordDiffs } from "./resolveWordDiffs";

export function getWrittenAnswerDiffs(
  answerType: WrittenAnswerType,
  userInput: string,
  correctAnswer: string,
): TokenDiff[] {
  if (answerType === "word") {
    return getCharacterDifferences(userInput, correctAnswer);
  }

  return resolveWordDiffs(getWordDifferences(userInput, correctAnswer));
}
