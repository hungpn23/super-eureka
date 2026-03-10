import { levenshteinDistance } from "./levenshteinDistance";

export function levenshteinSimilarity(
	userInput: string,
	correctAnswer: string,
) {
	if (userInput === correctAnswer) return 1;
	if (!userInput.length || !correctAnswer.length) return 0;

	const distance = levenshteinDistance(userInput, correctAnswer);
	return 1 - distance / Math.max(userInput.length, correctAnswer.length);
}
