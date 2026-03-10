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
		let highestSimilarity = -1;
		let mostSimilarWord = null;
		let bestMatchedIndex = -1;

		correctWords.forEach((correctWord, correctWordIndex) => {
			if (alreadyMatchedIndexes.has(correctWordIndex)) return;

			const similarity = levenshteinSimilarity(userWord, correctWord);
			if (similarity > highestSimilarity) {
				highestSimilarity = similarity;
				mostSimilarWord = correctWord;
				bestMatchedIndex = correctWordIndex;
			}
		});

		if (highestSimilarity >= correctThreshold) {
			alreadyMatchedIndexes.add(bestMatchedIndex);

			matchedWordPairs.push({
				userWord,
				mostSimilarWord,
				similarity: highestSimilarity,
				isMatched: true,
			});
		} else {
			matchedWordPairs.push({
				userWord,
				mostSimilarWord: null,
				similarity: highestSimilarity,
				isMatched: false,
			});
		}
	}

	const matchedCount = matchedWordPairs.filter(
		(p) => p.mostSimilarWord !== null,
	).length;

	const score = (2 * matchedCount) / (userWords.length + correctWords.length);

	return {
		score,
		matchedWordPairs,
		userWords,
		correctWords,
	};
}
