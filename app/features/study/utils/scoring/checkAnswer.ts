import { DEFAULT_WORD_SIMILARITY_THRESHOLD } from "../../constants";
import {
	evaluateSentenceSimilarity,
	type WordInSentenceSimilarity,
} from "./evaluateSentenceSimilarity";
import {
	evaluateWordSimilarity,
	type WordSimilarityStatus,
} from "./evaluateWordSimilarity";

export type CheckAnswerWordReturn = {
	type: "word";
	score: number;
	status: WordSimilarityStatus;
};

export type SentenceSimilarityStatus = "correct" | "almost" | "incorrect";

export type CheckAnswerSentenceReturn = {
	type: "sentence";
	score: number;
	status: SentenceSimilarityStatus;
	wordSimilarities: WordInSentenceSimilarity[];
};

export type CheckAnswerReturn =
	| CheckAnswerWordReturn
	| CheckAnswerSentenceReturn;

const SENTENCE_SIMILARITY_THRESHOLD = DEFAULT_WORD_SIMILARITY_THRESHOLD;

export function checkAnswer(
	userInput: string,
	correctAnswer: string,
): CheckAnswerReturn {
	const isWord = userInput.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		const similarity = evaluateWordSimilarity(userInput, correctAnswer);

		return {
			type: "word",
			score: similarity.score,
			status: similarity.status,
		} satisfies CheckAnswerWordReturn;
	} else {
		const { score, wordSimilarities } =
			evaluateSentenceSimilarity(userInput, correctAnswer);

		let status: SentenceSimilarityStatus;
		if (score === 1) {
			status = "correct";
		} else if (score >= SENTENCE_SIMILARITY_THRESHOLD) {
			status = "almost";
		} else {
			status = "incorrect";
		}

		return {
			type: "sentence",
			score,
			wordSimilarities,
			status,
		} satisfies CheckAnswerSentenceReturn;
	}
}
