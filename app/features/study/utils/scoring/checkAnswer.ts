import { normalize } from "~/shared/utils";
import type { ScoringWord } from "../../types";
import { levenshteinSimilarity } from "./levenshteinSimilarity";
import { scoreSentenceWords } from "./scoreSentenceWords";

type CheckAnswerSentenceReturn = CheckAnswerReturn & {
	scoringWords: ScoringWord[];
	inputWords: string[];
	correctWords: string[];
};

type CheckAnswerReturn = {
	type: CheckAnswerInputType;
	score: number;
	result: CheckAnswerResult;
};

type CheckAnswerResult = "correct" | "typo" | "almost" | "incorrect";

type CheckAnswerInputType = "word" | "sentence";

enum ScoringThreshold {
	CORRECT = 1,
	TYPO = 0.75,
	ALMOST = 0.75,
}

export function checkAnswer(
	userInput: string,
	correctAnswer: string,
): CheckAnswerReturn | CheckAnswerSentenceReturn {
	const normalUserInput = normalize(userInput);
	const normalCorrectAnswer = normalize(correctAnswer);

	const isWord = normalUserInput.split(/\s+/).filter(Boolean).length <= 1;
	if (isWord) {
		const score = levenshteinSimilarity(normalUserInput, normalCorrectAnswer);
		const result =
			score === ScoringThreshold.CORRECT
				? "correct"
				: score >= ScoringThreshold.TYPO
					? "typo"
					: "incorrect";

		return { type: "word", score, result } satisfies CheckAnswerReturn;
	} else {
		const { score, scoringWords, inputWords, correctWords } =
			scoreSentenceWords({
				inputSentence: normalUserInput,
				correctSentence: normalCorrectAnswer,
			});

		const result =
			score === ScoringThreshold.CORRECT
				? "correct"
				: score >= ScoringThreshold.ALMOST
					? "almost"
					: "incorrect";

		return {
			type: "sentence",
			score,
			scoringWords,
			inputWords,
			correctWords,
			result,
		} satisfies CheckAnswerSentenceReturn;
	}
}
