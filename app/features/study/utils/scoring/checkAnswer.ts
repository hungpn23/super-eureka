import {
	evaluateSentenceSimilarity,
	type SentenceSimilarityStatus,
	type WordInSentenceSimilarity,
} from "./evaluateSentenceSimilarity";
import {
	evaluateWordSimilarity,
	type WordSimilarityStatus,
} from "./evaluateWordSimilarity";

export type CheckAnswerResult = CheckWordResult | CheckSentenceResult;

export type CheckWordResult = {
	type: "word";
	score: number;
	status: WordSimilarityStatus;
};

export type CheckSentenceResult = {
	type: "sentence";
	score: number;
	status: SentenceSimilarityStatus;
	similarities: WordInSentenceSimilarity[];
};

export function checkAnswer(
	userInput: string,
	correctAnswer: string,
): CheckAnswerResult {
	const isWord = userInput.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		const { score, status } = evaluateWordSimilarity(userInput, correctAnswer);

		return {
			type: "word",
			score,
			status,
		} satisfies CheckWordResult;
	} else {
		const {
			score,
			status,
			similarities: wordSimilarities,
		} = evaluateSentenceSimilarity({
			inputSentence: userInput,
			correctSentence: correctAnswer,
		});

		return {
			type: "sentence",
			score,
			status,
			similarities: wordSimilarities,
		} satisfies CheckSentenceResult;
	}
}
