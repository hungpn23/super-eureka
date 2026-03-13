// ─────────────────────────────────────────────────────────────
// getTokenDifferences
// So sánh 2 mảng token (ký tự hoặc từ) bằng LCS traceback,
// trả về danh sách DiffToken với trạng thái:
//   "keep"   → token đúng, giữ nguyên
//   "delete" → token thừa trong input (cần xóa)
//   "insert" → token thiếu trong input (cần thêm vào)
// ─────────────────────────────────────────────────────────────

import type { DiffToken, DiffTokenType } from "../../types";
import { buildLCSTable } from "./buildLCSTable";

export function getTokenDifferences(
	inputTokens: string[],
	correctTokens: string[],
	tokenType: DiffTokenType,
): DiffToken[] {
	const lcsTable = buildLCSTable(inputTokens, correctTokens);

	const diffTokens: DiffToken[] = [];

	// traceback
	let inputPos = inputTokens.length;
	let correctPos = correctTokens.length;

	while (inputPos > 0 || correctPos > 0) {
		const inputValue = inputTokens[inputPos - 1];
		const correctValue = correctTokens[correctPos - 1];
		const isMatched = inputValue === correctValue;
		const bothHaveTokensLeft = inputPos > 0 && correctPos > 0;
		const correctStillHasTokens = correctPos > 0;

		const leftCell = lcsTable[inputPos]![correctPos - 1]!;
		const topCell = lcsTable[inputPos - 1]![correctPos]!;
		const leftHasBetterLCS = leftCell >= topCell;

		const inputHasNoTokenLeft = inputPos === 0;
		const goLeftIsBetter = inputHasNoTokenLeft || leftHasBetterLCS;

		if (bothHaveTokensLeft && isMatched) {
			// token giống nhau → giữ nguyên, lùi chéo
			diffTokens.unshift({
				type: tokenType,
				value: inputValue!,
				operation: "keep",
			});
			inputPos--;
			correctPos--;
		} else if (correctStillHasTokens && goLeftIsBetter) {
			// input đang thiếu token này → insert
			diffTokens.unshift({
				type: tokenType,
				value: correctValue!,
				operation: "insert",
			});
			correctPos--;
		} else {
			// input đang thừa token này → delete
			diffTokens.unshift({
				type: tokenType,
				value: inputValue!,
				operation: "delete",
			});
			inputPos--;
		}
	}

	return diffTokens;
}
