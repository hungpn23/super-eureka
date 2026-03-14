import {
	evaluateSentenceSimilarity,
	type WordInSentenceSimilarity,
} from "./evaluateSentenceSimilarity";
import { evaluateWordSimilarity } from "./evaluateWordSimilarity";

export type CheckAnswerWordReturn = {
	type: "word";
	score: number;
	result: CheckAnswerResult;
};

export type CheckAnswerSentenceReturn = {
	type: "sentence";
	score: number;
	result: CheckAnswerResult;
	scoringWords: WordInSentenceSimilarity[];
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
	const isWord = userInput.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		const similarity = evaluateWordSimilarity(userInput, correctAnswer);

		let result: CheckAnswerResult;
		if (similarity.score === ScoringThreshold.CORRECT) {
			similarity.status = "correct";
		} else if (similarity.score >= ScoringThreshold.TYPO) {
			similarity.status = "typo";
		} else {
			similarity.status = "incorrect";
		}

		return {
			type: "word",
			score: similarity.score,
			result: similarity.status,
		} satisfies CheckAnswerWordReturn;
	} else {
		const { score, wordSimilarities: scoringWords } =
			evaluateSentenceSimilarity(userInput, correctAnswer);

		let result: CheckAnswerResult;
		if (score === ScoringThreshold.CORRECT) {
			result = "correct";
		} else if (score >= ScoringThreshold.ALMOST) {
			result = "almost";
		} else {
			result = "incorrect";
		}

		return {
			type: "sentence",
			score,
			scoringWords,
			result,
		} satisfies CheckAnswerSentenceReturn;
	}
}
