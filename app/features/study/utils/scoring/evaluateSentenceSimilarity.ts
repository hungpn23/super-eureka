import { SIMILARITY_THRESHOLD } from "../../constants";
import {
	evaluateWordSimilarity,
	type WordSimilarity,
	type WordSimilarityStatus,
} from "./evaluateWordSimilarity";

export type SentenceSimilarity = {
	score: number;
	status: SentenceSimilarityStatus;
	similarities: WordInSentenceSimilarity[];
};

export type WordInSentenceSimilarity = WordSimilarity & {
	inputWord: string;
	mostSimilarWord: string | null;
};

export type SentenceSimilarityStatus = "correct" | "almost" | "incorrect";

export type EvaluateSentenceSimilarityOptions = {
	userInput: string;
	correctAnswer: string;
	sentenceSimilarityThreshold?: number;
	wordSimilarityThreshold?: number;
};

/**
 * @description tính toán mức độ tương đồng giữa 2 câu
 * @returns score: số thực [0...1], detail: chi tiết điểm số từng từ kèm đánh giá (WordInSentenceSimilarity)
 */
export function evaluateSentenceSimilarity(
	options: EvaluateSentenceSimilarityOptions,
): SentenceSimilarity {
	const {
		userInput,
		correctAnswer,
		sentenceSimilarityThreshold = SIMILARITY_THRESHOLD.SENTENCE,
		wordSimilarityThreshold = SIMILARITY_THRESHOLD.WORD,
	} = options;

	const inputWords = userInput.split(/\s+/).filter(Boolean);
	const correctWords = correctAnswer.split(/\s+/).filter(Boolean);
	const similarities: WordInSentenceSimilarity[] = [];

	if (!inputWords.length || !correctWords.length)
		return { score: 0, status: "incorrect", similarities: [] };

	const matchedCorrectWordIndexes = new Set<number>();

	for (const inputWord of inputWords) {
		let bestSimilarityScore = -1;
		let bestSimilarityStatus: WordSimilarityStatus = "incorrect";
		let mostSimilarWord: string | null = null;
		let mostSimilarWordIndex = -1;

		correctWords.forEach((correctWord, correctWordIndex) => {
			if (matchedCorrectWordIndexes.has(correctWordIndex)) return;

			const similarity = evaluateWordSimilarity(inputWord, correctWord);
			if (similarity.score > bestSimilarityScore) {
				bestSimilarityScore = similarity.score;
				bestSimilarityStatus = similarity.status;
				mostSimilarWord = correctWord;
				mostSimilarWordIndex = correctWordIndex;
			}
		});

		if (bestSimilarityScore === 1) {
			matchedCorrectWordIndexes.add(mostSimilarWordIndex);

			similarities.push({
				inputWord,
				mostSimilarWord,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		} else if (bestSimilarityScore >= wordSimilarityThreshold) {
			matchedCorrectWordIndexes.add(mostSimilarWordIndex);

			similarities.push({
				inputWord,
				mostSimilarWord,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		} else {
			similarities.push({
				inputWord,
				mostSimilarWord: null,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		}
	}

	const matchedCount = similarities.filter(
		(similarity) => similarity.status !== "incorrect",
	).length;

	const score = (2 * matchedCount) / (inputWords.length + correctWords.length); // use dice's coefficient algorithm

	let status: SentenceSimilarityStatus;
	if (score === 1) status = "correct";
	else if (score >= sentenceSimilarityThreshold) status = "almost";
	else status = "incorrect";

	return {
		score,
		status,
		similarities,
	};
}
