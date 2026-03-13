// ─────────────────────────────────────────────────────────────
// getWordDifferences
// So sánh 2 câu ở mức từ, trả về danh sách DiffToken với trạng thái:
//   "keep"   → từ đúng, giữ nguyên
//   "delete" → từ thừa trong input (cần xóa)
//   "insert" → từ thiếu trong input (cần thêm vào)
//
// Ví dụ: getWordDifferences("I go school", "I go to school")
//   I    → keep
//   go   → keep
//   to   → insert   ← thiếu "to"
//   school → keep
// ─────────────────────────────────────────────────────────────

import type { DiffToken } from "../../types";
import { getTokenDifferences } from "./getTokenDifferences";

export function getWordDifferences(
	inputSentence: string,
	correctSentence: string,
): DiffToken[] {
	return getTokenDifferences(
		inputSentence.split(/\s+/).filter(Boolean),
		correctSentence.split(/\s+/).filter(Boolean),
		"word",
	);
}
