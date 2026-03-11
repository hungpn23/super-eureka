import { normalize } from "~/shared/utils";
import { diceCoefficient } from "./diceCoefficient";
import { levenshteinDistance } from "./levenshteinDistance";
import { levenshteinSimilarity } from "./levenshteinSimilarity";

export function checkAnswer(userInput: string, correctAnswer: string) {
	const user = normalize(userInput);
	const correct = normalize(correctAnswer);
	const isWord = user.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		const score = levenshteinSimilarity(user, correct);
		const dist = levenshteinDistance(user, correct);
		const result = score === 1 ? "correct" : score >= 0.75 ? "typo" : "wrong";
		return { type: "word", score, dist, result };
	} else {
		const { score, avgScore, matchedWordPairs, userWords, correctWords } =
			diceCoefficient(user, correct);

		const result =
			score === 1 && avgScore === 1
				? "correct"
				: score >= 0.8 && avgScore! >= 0.8
					? "almost"
					: score >= 0.5
						? "partial"
						: "wrong";

		return {
			type: "sentence",
			score,
			avgScore,
			matchedWordPairs,
			userWords,
			correctWords,
			result,
		};
	}
}
