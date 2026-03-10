import { normalize } from "../common";
import { levenshteinDistance } from "./levenshteinDistance";
import { levenshteinSimilarity } from "./levenshteinSimilarity";
import { wordDiceFuzzy } from "./wordDiceFuzzy";

export function checkAnswer(userInput: string, correctAnswer: string) {
	const user = normalize(userInput);
	const correct = normalize(correctAnswer);
	const tokens = user.split(/\s+/).filter(Boolean);
	const isWord = tokens.length <= 1;

	if (isWord) {
		const score = levenshteinSimilarity(user, correct);
		const dist = levenshteinDistance(user, correct);
		const result = score === 1 ? "correct" : score >= 0.75 ? "typo" : "wrong";
		return { mode: "word", score, dist, result };
	} else {
		const { score, matchedPairs, wordsA, wordsB } = wordDiceFuzzy(
			user,
			correct,
		);
		const result =
			score === 1
				? "correct"
				: score >= 0.8
					? "almost"
					: score >= 0.5
						? "partial"
						: "wrong";
		return { mode: "sentence", score, matchedPairs, wordsA, wordsB, result };
	}
}
