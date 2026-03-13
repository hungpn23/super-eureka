import type { ScoringWord } from "../../types";
import { evaluateSimilarity } from "./evaluateSimilarity";

type ScoreSentenceWordsOptions = {
	inputSentence: string;
	correctSentence: string;
	correctThreshold?: number;
};

type ScoreSentenceWordsReturn = {
	score: number;
	scoringWords: ScoringWord[];
	inputWords: string[];
	correctWords: string[];
};

/**
 * @description Score each word in the input sentence against the correct sentence
 * using Levenshtein similarity for word matching, then calculate the overall
 * Dice coefficient as the final score.
 * @returns The Dice coefficient score and the matched word pairs.
 */
export function scoreSentenceWords({
	inputSentence,
	correctSentence,
	correctThreshold = 0.75,
}: ScoreSentenceWordsOptions): ScoreSentenceWordsReturn {
	const inputWords = inputSentence.split(/\s+/).filter(Boolean);
	const correctWords = correctSentence.split(/\s+/).filter(Boolean);
	const scoringWords: ScoringWord[] = [];

	if (!inputWords.length || !correctWords.length)
		return { score: 0, scoringWords, inputWords, correctWords };

	const usedCorrectWordIndexes = new Set<number>();

	for (const inputWord of inputWords) {
		let currentSimilarity = -1;
		let mostSimilarWord: string | null = null;
		let usedCorrectWordIndex = -1;

		correctWords.forEach((correctWord, correctWordIndex) => {
			if (usedCorrectWordIndexes.has(correctWordIndex)) return;

			const similarity = evaluateSimilarity(inputWord, correctWord);
			if (similarity > currentSimilarity) {
				currentSimilarity = similarity;
				mostSimilarWord = correctWord;
				usedCorrectWordIndex = correctWordIndex;
			}
		});

		if (currentSimilarity >= correctThreshold) {
			usedCorrectWordIndexes.add(usedCorrectWordIndex);

			scoringWords.push({
				userWord: inputWord,
				mostSimilarWord,
				similarity: currentSimilarity,
				isAccepted: true,
			});
		} else {
			scoringWords.push({
				userWord: inputWord,
				mostSimilarWord: null,
				similarity: currentSimilarity,
				isAccepted: false,
			});
		}
	}

	const matchedCount = scoringWords.filter((p) => p.isAccepted).length;
	const score = (2 * matchedCount) / (inputWords.length + correctWords.length);

	return {
		score,
		scoringWords,
		inputWords,
		correctWords,
	};
}
