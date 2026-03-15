// ─────────────────────────────────────────────────────────────
// resolveWordDiffs
// Hậu xử lý kết quả từ getWordDifferences:
// Ghép cặp delete ↔ insert khi 2 từ đủ giống nhau (fuzzy match)
// thành word diff có charDiff để hiển thị chi tiết.
//
// Ví dụ: "lerned english" vs "learned English"
//   raw:  [delete:"lerned", insert:"learned", delete:"english", insert:"English"]
//   sau:  [delete:"lerned" (charDiff), delete:"english" (charDiff)]
// ─────────────────────────────────────────────────────────────

import type { WordDiff } from "../../types";
import { evaluateWordSimilarity } from "../scoring/evaluateWordSimilarity";
import { getCharacterDifferences } from "./getCharacterDifferences";

const REPLACE_THRESHOLD = 0.3;

export function resolveWordDiffs(rawDiffs: WordDiff[]): WordDiff[] {
  if (!rawDiffs.length || rawDiffs.some((token) => token.type !== "word")) {
    return [];
  }

  // 1) Chuẩn bị dữ liệu word-diff có index gốc để dễ thay thế về sau
  const indexedDiffs = rawDiffs.map((token, index) => ({
    ...token,
    originalIndex: index,
  }));

  const deleteDiffs = indexedDiffs.filter(
    (item) => item.operation === "delete",
  );

  const insertDiffs = indexedDiffs.filter(
    (item) => item.operation === "insert",
  );

  // 2) Ghép cặp delete ↔ insert theo độ giống nhau để tạo charDiff (replace)
  const matchedInsertDiffIndexes = new Set<number>();
  const matchedDeleteOriginalIndexes = new Set<number>();
  const replaceByInsertOriginalIndex = new Map<number, WordDiff>(); // insert rawIndex → replace diff

  for (const deleteDiff of deleteDiffs) {
    let bestSimilarityScore = -1;
    let matchedInsertDiffIndex = -1;

    insertDiffs.forEach((_, i) => {
      if (matchedInsertDiffIndexes.has(i)) return;

      const { score } = evaluateWordSimilarity(
        deleteDiff.value,
        insertDiffs[i]!.value,
      );

      if (score > bestSimilarityScore) {
        bestSimilarityScore = score;
        matchedInsertDiffIndex = i;
      }
    });

    if (
      bestSimilarityScore >= REPLACE_THRESHOLD &&
      matchedInsertDiffIndex >= 0
    ) {
      matchedInsertDiffIndexes.add(matchedInsertDiffIndex);
      matchedDeleteOriginalIndexes.add(deleteDiff.originalIndex);

      const insertDiff = insertDiffs[matchedInsertDiffIndex]!;
      replaceByInsertOriginalIndex.set(insertDiff.originalIndex, {
        type: "word",
        value: deleteDiff.value,
        operation: "replace",
        charDiff: getCharacterDifferences(deleteDiff.value, insertDiff.value),
      });
    }
  }

  // 3) Dựng kết quả theo thứ tự raw, nhưng giữ "câu đúng" ở giữa:
  //    - keep: giữ nguyên
  //    - insert: nếu được ghép thì thay bằng replace, nếu không thì giữ nguyên
  //    - delete: nếu đã được ghép thì bỏ qua
  //    - delete chưa ghép: tách thành before/after theo vị trí delete đã ghép đầu tiên
  const resolvedDiffs: WordDiff[] = [];
  const leadingDeletes: WordDiff[] = [];
  const trailingDeletes: WordDiff[] = [];
  const matchedDeleteIndexes = [...matchedDeleteOriginalIndexes];
  if (matchedDeleteIndexes.length === 0) {
    return rawDiffs;
  }
  const pivotDeleteIndex = Math.min(...matchedDeleteIndexes);

  // 3.1) Gom delete chưa ghép về hai nhóm: trước/sau pivot
  for (let i = 0; i < rawDiffs.length; i++) {
    const diff = rawDiffs[i]!;
    if (diff.operation !== "delete") continue;
    if (matchedDeleteOriginalIndexes.has(i)) continue;

    if (i < pivotDeleteIndex) {
      leadingDeletes.push(diff);
    } else {
      trailingDeletes.push(diff);
    }
  }

  // 3.2) Duyệt raw để dựng phần "câu đúng" (keep + insert/replace)
  for (let i = 0; i < rawDiffs.length; i++) {
    const diff = rawDiffs[i]!;

    if (diff.operation === "keep") {
      resolvedDiffs.push(diff);
    } else if (diff.operation === "insert") {
      resolvedDiffs.push(replaceByInsertOriginalIndex.get(i) ?? diff);
    } else if (diff.operation === "replace") {
      resolvedDiffs.push(diff);
    }
  }

  return [...leadingDeletes, ...resolvedDiffs, ...trailingDeletes];
}
