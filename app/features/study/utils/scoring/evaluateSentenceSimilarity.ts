import { DEFAULT_WORD_SIMILARITY_THRESHOLD } from "../../constants";
import {
	evaluateWordSimilarity,
	type WordSimilarity,
	type WordSimilarityStatus,
} from "./evaluateWordSimilarity";

export type SentenceSimilarity = {
	score: number;
	wordSimilarities: WordInSentenceSimilarity[];
};

export type WordInSentenceSimilarity = WordSimilarity & {
	inputWord: string;
	mostSimilarWord: string | null;
};

/**
 * @description tính toán mức độ tương đồng giữa 2 câu
 * @returns score: số thực [0...1], detail: chi tiết điểm số từng từ kèm đánh giá (WordInSentenceSimilarity)
 */
export function evaluateSentenceSimilarity(
	input: string,
	correct: string,
	wordSimilarityThreshold: number = DEFAULT_WORD_SIMILARITY_THRESHOLD,
): SentenceSimilarity {
	const inputWords = input.split(/\s+/).filter(Boolean);
	const correctWords = correct.split(/\s+/).filter(Boolean);
	const wordSimilarities: WordInSentenceSimilarity[] = [];

	if (!inputWords.length || !correctWords.length)
		return { score: 0, wordSimilarities };

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

			wordSimilarities.push({
				inputWord,
				mostSimilarWord,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		} else if (bestSimilarityScore >= wordSimilarityThreshold) {
			matchedCorrectWordIndexes.add(mostSimilarWordIndex);

			wordSimilarities.push({
				inputWord,
				mostSimilarWord,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		} else {
			wordSimilarities.push({
				inputWord,
				mostSimilarWord: null,
				score: bestSimilarityScore,
				status: bestSimilarityStatus,
			});
		}
	}

	const matchedCount = wordSimilarities.filter(
		(similarity) => similarity.status !== "incorrect",
	).length;

	const score = (2 * matchedCount) / (inputWords.length + correctWords.length); // use dice's coefficient algorithm

	return {
		score,
		wordSimilarities,
	};
}
