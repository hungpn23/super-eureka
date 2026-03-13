import { getLevenshteinDistance } from "./getLevenshteinDistance";

/**
 * @description đánh giá mức độ tương đồng giữa 2 chuỗi
 * @returns số thực [0...1]
 */
export function evaluateSimilarity(userInput: string, correctAnswer: string) {
	if (userInput === correctAnswer) return 1;
	if (!userInput.length || !correctAnswer.length) return 0;

	const distance = getLevenshteinDistance(userInput, correctAnswer);
	return 1 - distance / Math.max(userInput.length, correctAnswer.length);
}
