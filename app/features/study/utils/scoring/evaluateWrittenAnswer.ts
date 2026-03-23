import {
	evaluateSentenceSimilarity,
	type SentenceSimilarityStatus,
	type WordInSentenceSimilarity,
} from "./evaluateSentenceSimilarity";
import {
	evaluateWordSimilarity,
	type WordSimilarityStatus,
} from "./evaluateWordSimilarity";

type WrittenAnswerType = "word" | "sentence";

export type EvaluateWrittenAnswerResult =
	| EvaluateWordResult
	| EvaluateSentenceResult;

export type EvaluateWordResult = {
	type: Extract<WrittenAnswerType, "word">;
	score: number;
	status: WordSimilarityStatus;
};

export type EvaluateSentenceResult = {
	type: Extract<WrittenAnswerType, "sentence">;
	score: number;
	status: SentenceSimilarityStatus;
	similarities: WordInSentenceSimilarity[];
};

export function evaluateWrittenAnswer(
	userInput: string,
	correctAnswer: string,
): EvaluateWrittenAnswerResult {
	const isWord = userInput.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		const result: EvaluateWordResult = {
			type: "word",
			score: 0,
			status: "incorrect",
		};

		if (userInput.length <= 3 && userInput !== correctAnswer) {
			return result;
		}

		const evaluatedResult = evaluateWordSimilarity(userInput, correctAnswer);
		return Object.assign(result, evaluatedResult);
	} else {
		const result: EvaluateSentenceResult = {
			type: "sentence",
			score: 0,
			status: "incorrect",
			similarities: [],
		};

		const evaluatedResult = evaluateSentenceSimilarity({
			userInput,
			correctAnswer,
		});

		return Object.assign(result, evaluatedResult);
	}
}
