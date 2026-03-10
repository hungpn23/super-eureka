import { levenshteinSimilarity } from "./levenshteinSimilarity";

export function wordDiceFuzzy(
	inputSentence: string,
	correctSentence: string,
	threshold = 0.75,
) {
	const wordsA = inputSentence.split(/\s+/).filter(Boolean);
	const wordsB = correctSentence.split(/\s+/).filter(Boolean);
	if (!wordsA.length || !wordsB.length) return { score: 0, matchedPairs: [] };

	const matchedPairs = [];
	const usedB = new Set();

	for (const wordA of wordsA) {
		let bestSim = -1,
			bestWord = null,
			bestIdx = -1;
		wordsB.forEach((wordB, idx) => {
			if (usedB.has(idx)) return;
			const sim = levenshteinSimilarity(wordA, wordB);
			if (sim > bestSim) {
				bestSim = sim;
				bestWord = wordB;
				bestIdx = idx;
			}
		});
		if (bestSim >= threshold) {
			usedB.add(bestIdx);
			matchedPairs.push({ input: wordA, correct: bestWord, sim: bestSim });
		} else {
			matchedPairs.push({ input: wordA, correct: null, sim: bestSim });
		}
	}

	const matched = matchedPairs.filter((p) => p.correct !== null).length;
	const score = (2 * matched) / (wordsA.length + wordsB.length);
	return { score, matchedPairs, wordsA, wordsB };
}
