import { normalize } from "~/shared/utils";
import type { DiffToken } from "../../types";
import {
	type CheckAnswerSentenceReturn,
	type CheckAnswerWordReturn,
	checkAnswer,
} from "./checkAnswer";
import { getCharacterDifferences } from "./getCharacterDifferences";
import { getWordDifferences } from "./getWordDifferences";
import {
	type ResolvedToken,
	resolveWordReplacements,
} from "./resolveWordReplacements";

export type EvaluateAnswerWordReturn = CheckAnswerWordReturn & {
	diff: DiffToken[] | null;
};

export type EvaluateAnswerSentenceReturn = CheckAnswerSentenceReturn & {
	diff: ResolvedToken[] | null;
};

export type EvaluateAnswerReturn =
	| EvaluateAnswerWordReturn
	| EvaluateAnswerSentenceReturn;

export function evaluateAnswer(
	userInput: string,
	correctAnswer: string,
): EvaluateAnswerReturn {
	// Bước 1: Check answer → lấy score + result
	const checkResult = checkAnswer(userInput, correctAnswer);

	// Bước 2: Nếu đúng hoàn toàn → không cần diff
	if (checkResult.result === "correct") {
		return { ...checkResult, diff: null } satisfies EvaluateAnswerReturn;
	}

	// Bước 3: Tạo diff tokens tuỳ theo type
	const normalizedInput = normalize(userInput);
	const normalizedCorrect = normalize(correctAnswer);

	if (checkResult.type === "word") {
		// User nhập 1 từ → so sánh ký tự
		const diff: DiffToken[] = getCharacterDifferences(
			normalizedInput,
			normalizedCorrect,
		);
		return { ...checkResult, diff } satisfies EvaluateAnswerWordReturn;
	} else {
		// User nhập câu → so sánh từ, rồi resolve replacements
		const rawWordDiff: DiffToken[] = getWordDifferences(
			normalizedInput,
			normalizedCorrect,
		);
		const diff: ResolvedToken[] = resolveWordReplacements(rawWordDiff);
		if (diff[0]?.type === "word") {
			console.log(diff[0].charDiff); // error here
		}
		return { ...checkResult, diff } satisfies EvaluateAnswerSentenceReturn;
	}
}

// ─── TEST ────────────────────────────────────────────────────
// Case 1: Từ đúng hoàn toàn → result: "correct", diff: null
console.log("=== Case 1: Từ đúng ===");
console.log(JSON.stringify(evaluateAnswer("learned", "learned"), null, 2));

// Case 2: Từ sai chính tả (typo) → result: "typo", diff: character-level
console.log("\n=== Case 2: Từ typo ===");
console.log(JSON.stringify(evaluateAnswer("lernedz", "learned"), null, 2));

// Case 3: Từ sai hoàn toàn → result: "incorrect", diff: character-level
console.log("\n=== Case 3: Từ sai ===");
console.log(JSON.stringify(evaluateAnswer("apple", "learned"), null, 2));

// Case 4: Câu đúng hoàn toàn → result: "correct", diff: null
console.log("\n=== Case 4: Câu đúng ===");
console.log(
	JSON.stringify(evaluateAnswer("I go to school", "I go to school"), null, 2),
);

// Case 5: Câu gần đúng (almost) → result: "almost", diff: word-level với replace
console.log("\n=== Case 5: Câu gần đúng ===");
console.log(
	JSON.stringify(
		evaluateAnswer("I lerned english yesterday", "I learned English yesterday"),
		null,
		2,
	),
);

// Case 6: Câu thiếu từ → diff có insert
console.log("\n=== Case 6: Câu thiếu từ ===");
console.log(
	JSON.stringify(evaluateAnswer("I go school", "I go to school"), null, 2),
);

// Case 7: Câu thừa từ → diff có delete
console.log("\n=== Case 7: Câu thừa từ ===");
console.log(
	JSON.stringify(
		evaluateAnswer("I go to the school", "I go to school"),
		null,
		2,
	),
);

// Case 8: Câu sai hoàn toàn → result: "incorrect"
console.log("\n=== Case 8: Câu sai hoàn toàn ===");
console.log(
	JSON.stringify(evaluateAnswer("the cat is red", "I go to school"), null, 2),
);
