import type { TokenDiff } from "../../types";
import type {
	EvaluateSentenceResult,
	EvaluateWordResult,
} from "../scoring/evaluateWrittenAnswer";
import { getCharacterDifferences } from "./getCharacterDifferences";
import { getWordDifferences } from "./getWordDifferences";
import { resolveWordDiffs } from "./resolveWordDiffs";

type EvaluateWrittenAnswerResult = EvaluateWordResult | EvaluateSentenceResult;

export function getWrittenAnswerDiffs(
	result: EvaluateWrittenAnswerResult,
	userInput: string,
	correctAnswer: string,
): TokenDiff[] {
	if (result.type === "word") {
		return getCharacterDifferences(userInput, correctAnswer);
	}

	return resolveWordDiffs(getWordDifferences(userInput, correctAnswer));
}
