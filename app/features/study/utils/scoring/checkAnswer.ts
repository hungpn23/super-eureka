import { normalize } from "~/shared/utils";
import type { ScoringWord } from "../../types";
import { evaluateSimilarity } from "./evaluateSimilarity";
import { scoreSentenceWords } from "./scoreSentenceWords";

export type CheckAnswerWordReturn = {
	type: "word";
	score: number;
	result: CheckAnswerResult;
};

export type CheckAnswerSentenceReturn = {
	type: "sentence";
	score: number;
	result: CheckAnswerResult;
	scoringWords: ScoringWord[];
	inputWords: string[];
	correctWords: string[];
};

export type CheckAnswerReturn =
	| CheckAnswerWordReturn
	| CheckAnswerSentenceReturn;

export type CheckAnswerResult = "correct" | "typo" | "almost" | "incorrect";

enum ScoringThreshold {
	CORRECT = 1,
	TYPO = 0.75,
	ALMOST = 0.75,
}

export function checkAnswer(
	userInput: string,
	correctAnswer: string,
): CheckAnswerReturn {
	const normalUserInput = normalize(userInput);
	const normalCorrectAnswer = normalize(correctAnswer);

	const isWord = normalUserInput.split(/\s+/).filter(Boolean).length <= 1;
	if (isWord) {
		const score = evaluateSimilarity(normalUserInput, normalCorrectAnswer);
		const result =
			score === ScoringThreshold.CORRECT
				? "correct"
				: score >= ScoringThreshold.TYPO
					? "typo"
					: "incorrect";

		return { type: "word", score, result } satisfies CheckAnswerWordReturn;
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
