// ─────────────────────────────────────────────────────────────
// getCharacterDifferences
// So sánh 2 từ ở mức ký tự, trả về danh sách DiffToken với trạng thái:
//   "keep"   → ký tự đúng, giữ nguyên
//   "delete" → ký tự thừa trong input (cần xóa)
//   "insert" → ký tự thiếu trong input (cần thêm vào)
//
// Ví dụ: getCharacterDifferences("lernedz", "learned")
//   l → keep
//   e → keep
//   a → insert   ← thiếu "a"
//   r → keep
//   n → keep
//   e → keep
//   d → keep
//   z → delete   ← thừa "z"
// ─────────────────────────────────────────────────────────────

import type { DiffToken } from "../../types";
import { getTokenDifferences } from "./getTokenDifferences";

export function getCharacterDifferences(
	inputWord: string,
	correctWord: string,
): DiffToken[] {
	return getTokenDifferences(
		inputWord.split(""),
		correctWord.split(""),
		"character",
	);
}
