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
		const { score, status } = evaluateWordSimilarity(userInput, correctAnswer);

		return {
			type: "word",
			score,
			status,
		} satisfies EvaluateWordResult;
	} else {
		const { score, status, similarities } = evaluateSentenceSimilarity({
			inputSentence: userInput,
			correctSentence: correctAnswer,
		});

		return {
			type: "sentence",
			score,
			status,
			similarities,
		} satisfies EvaluateSentenceResult;
	}
}
