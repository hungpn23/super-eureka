import type { MatchedWordPair } from "../../types";
import { levenshteinSimilarity } from "./levenshteinSimilarity";

/**
 * @description Calculate the dice coefficient between two sentences.
 * @returns The dice coefficient and the matched word pairs.
 */
export function diceCoefficient(
	inputSentence: string,
	correctSentence: string,
	correctThreshold = 0.75,
) {
	const userWords = inputSentence.split(/\s+/).filter(Boolean);
	const correctWords = correctSentence.split(/\s+/).filter(Boolean);
	if (!userWords.length || !correctWords.length)
		return { score: 0, matchedPairs: [] };

	const matchedWordPairs: MatchedWordPair[] = [];
	const alreadyMatchedIndexes = new Set();

	for (const userWord of userWords) {
		let bestSimilarity = -1;
		let bestWord = null;
		let bestIndex = -1;

		correctWords.forEach((correctWord, correctWordIndex) => {
			if (alreadyMatchedIndexes.has(correctWordIndex)) return;

			const similarity = levenshteinSimilarity(userWord, correctWord);
			if (similarity > bestSimilarity) {
				bestSimilarity = similarity;
				bestWord = correctWord;
				bestIndex = correctWordIndex;
			}
		});

		if (bestSimilarity >= correctThreshold) {
			alreadyMatchedIndexes.add(bestIndex);

			matchedWordPairs.push({
				userWord,
				correctWord: bestWord,
				similarity: bestSimilarity,
			});
		} else {
			matchedWordPairs.push({
				userWord,
				correctWord: null,
				similarity: bestSimilarity,
			});
		}
	}

	const matchedCount = matchedWordPairs.filter(
		(p) => p.correctWord !== null,
	).length;

	const score = (2 * matchedCount) / (userWords.length + correctWords.length);
	return {
		score,
		matchedWordPairs,
		userWords,
		correctWords,
	};
}
