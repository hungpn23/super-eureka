import { getLevenshteinDistance } from "./getLevenshteinDistance";

export type WordSimilarity = {
	score: number;
	status: WordSimilarityStatus;
};

export type WordSimilarityStatus = "correct" | "typo" | "incorrect";

/**
 * @description tính toán mức độ tương đồng giữa 2 từ
 * @returns score: số thực [0...1], status: đánh giá mức độ tương đồng (WordSimilarityStatus)
 */
export function evaluateWordSimilarity(
	inputWord: string,
	correctWord: string,
): WordSimilarity {
	if (inputWord === correctWord) {
		return {
			score: 1,
			status: "correct",
		};
	}

	if (!inputWord.length || !correctWord.length) {
		return {
			score: 0,
			status: "incorrect",
		};
	}

	const distance = getLevenshteinDistance(inputWord, correctWord);
	const score = 1 - distance / Math.max(inputWord.length, correctWord.length);

	let status: WordSimilarityStatus;

	if (score === 1) status = "correct";
	else if (score >= 0.75) status = "typo";
	else status = "incorrect";

	return {
		score,
		status,
	};
}
