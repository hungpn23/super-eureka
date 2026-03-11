import { meanBy } from "lodash";
import type { ScoringWord } from "../../types";
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

	const scoringWords: ScoringWord[] = [];
	const alreadyMatchedIndexes = new Set<number>();

	for (const userWord of userWords) {
		let highestSimilarity = -1;
		let mostSimilarWord: string | null = null;
		let matchedIndex = -1;

		correctWords.forEach((correctWord, correctWordIndex) => {
			if (alreadyMatchedIndexes.has(correctWordIndex)) return;

			const similarity = levenshteinSimilarity(userWord, correctWord);
			if (similarity > highestSimilarity) {
				highestSimilarity = similarity;
				mostSimilarWord = correctWord;
				matchedIndex = correctWordIndex;
			}
		});

		if (highestSimilarity >= correctThreshold) {
			alreadyMatchedIndexes.add(matchedIndex);

			scoringWords.push({
				userWord,
				mostSimilarWord,
				similarity: highestSimilarity,
				isAccepted: true,
			});
		} else {
			scoringWords.push({
				userWord,
				mostSimilarWord: null,
				similarity: highestSimilarity,
				isAccepted: false,
			});
		}
	}

	const matchedCount = scoringWords.filter((p) => p.isAccepted).length;
	const score = (2 * matchedCount) / (userWords.length + correctWords.length);
	const avgScore = meanBy(scoringWords, "similarity");

	return {
		score,
		avgScore,
		matchedWordPairs: scoringWords,
		userWords,
		correctWords,
	};
}
