// ─────────────────────────────────────────────────────────────
// resolveWordReplacements
// Hậu xử lý kết quả từ getWordDifferences:
// Ghép cặp delete ↔ insert khi 2 từ đủ giống nhau (fuzzy match)
// thành token "replace", kèm charDiff để hiển thị chi tiết.
//
// Ví dụ: "lerned english" vs "learned English"
//   raw:  [delete:"lerned", insert:"learned", delete:"english", insert:"English"]
//   sau:  [replace:"lerned"→"learned" (charDiff), replace:"english"→"English" (charDiff)]
// ─────────────────────────────────────────────────────────────

import type { DiffToken } from "../../types";
import { evaluateWordSimilarity } from "../scoring/evaluateWordSimilarity";
import { getCharacterDifferences } from "./getCharacterDifferences";

export type ResolvedToken =
	| DiffToken
	| {
			type: "word";
			value: string;
			operation: "replace";
			correction: string;
			similarity: number;
			charDiff: DiffToken[];
	  };

const REPLACE_THRESHOLD = 0.3;

export function resolveWordReplacements(
	rawTokens: DiffToken[], // a set of tokens in one word with operation
): ResolvedToken[] {
	if (!rawTokens.length || rawTokens.some((token) => token.type !== "word")) {
		return [];
	}

	const tokenWithIndexes = rawTokens.map((token, index) => ({
		...token,
		originalIndex: index,
	}));

	const deleteTokens = tokenWithIndexes.filter(
		(item) => item.operation === "delete",
	);

	const insertTokens = tokenWithIndexes.filter(
		(item) => item.operation === "insert",
	);

	// Ghép cặp delete ↔ insert tốt nhất (best-match, không nhìn liền kề)
	const usedInsertIndexes = new Set<number>();
	const replacements = new Map<number, ResolvedToken>(); // rawIndex → replace token

	for (const deleteToken of deleteTokens) {
		let currentSimilarity = -1;
		let currentInsertTokenIndex = -1;

		insertTokens.forEach((_, insertIndex) => {
			if (usedInsertIndexes.has(insertIndex)) return;

			const newSimilarity = evaluateWordSimilarity(
				deleteToken.value,
				insertTokens[insertIndex]!.value,
			);

			if (newSimilarity > currentSimilarity) {
				currentSimilarity = newSimilarity;
				currentInsertTokenIndex = insertIndex;
			}
		});

		if (
			currentSimilarity >= REPLACE_THRESHOLD &&
			currentInsertTokenIndex >= 0
		) {
			usedInsertIndexes.add(currentInsertTokenIndex);
			const insertToken = insertTokens[currentInsertTokenIndex]!;

			replacements.set(deleteToken.originalIndex, {
				type: "word",
				value: deleteToken.value,
				operation: "replace",
				correction: insertToken.value,
				similarity: currentSimilarity,
				charDiff: getCharacterDifferences(deleteToken.value, insertToken.value),
			});
		}
	}

	// Xây kết quả theo thứ tự raw, thay delete bằng replace nếu có cặp
	const result: ResolvedToken[] = [];
	const usedInsertRawIndexes = new Set(
		[...usedInsertIndexes].map((item) => insertTokens[item]!.originalIndex),
	);

	for (let i = 0; i < rawTokens.length; i++) {
		const token = rawTokens[i]!;

		if (token.operation === "keep") {
			result.push(token);
		} else if (token.operation === "delete") {
			result.push(replacements.has(i) ? replacements.get(i)! : token);
		} else if (token.operation === "insert") {
			// insert gốc: bỏ qua nếu đã được ghép, giữ lại nếu chưa
			if (!usedInsertRawIndexes.has(i)) {
				result.push(token);
			}
		}
	}

	return result;
}
