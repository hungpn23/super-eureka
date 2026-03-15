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

export function resolveWordDiffs(rawWordDiffs: WordDiff[]): WordDiff[] {
  if (
    !rawWordDiffs.length ||
    rawWordDiffs.some((token) => token.type !== "word")
  ) {
    return [];
  }

  // 1) Chuẩn bị dữ liệu word-diff có index gốc để dễ thay thế về sau
  const indexedWordDiffs = rawWordDiffs.map((token, index) => ({
    ...token,
    originalIndex: index,
  }));

  const deleteWordDiffs = indexedWordDiffs.filter(
    (item) => item.operation === "delete",
  );

  const insertWordDiffs = indexedWordDiffs.filter(
    (item) => item.operation === "insert",
  );

  // 2) Ghép cặp delete ↔ insert theo độ giống nhau để tạo charDiff
  const usedInsertWordIndexes = new Set<number>();
  const resolvedWordDiffByIndex = new Map<number, WordDiff>(); // rawIndex → resolved diff

  for (const deleteWordDiff of deleteWordDiffs) {
    let bestSimilarityScore = -1;
    let bestInsertWordIndex = -1;

    insertWordDiffs.forEach((_, insertIndex) => {
      if (usedInsertWordIndexes.has(insertIndex)) return;

      const { score } = evaluateWordSimilarity(
        deleteWordDiff.value,
        insertWordDiffs[insertIndex]!.value,
      );

      if (score > bestSimilarityScore) {
        bestSimilarityScore = score;
        bestInsertWordIndex = insertIndex;
      }
    });

    if (bestSimilarityScore >= REPLACE_THRESHOLD && bestInsertWordIndex >= 0) {
      usedInsertWordIndexes.add(bestInsertWordIndex);
      const insertWordDiff = insertWordDiffs[bestInsertWordIndex]!;

      resolvedWordDiffByIndex.set(deleteWordDiff.originalIndex, {
        type: "word",
        value: deleteWordDiff.value,
        operation: "delete",
        charDiff: getCharacterDifferences(
          deleteWordDiff.value,
          insertWordDiff.value,
        ),
      });
    }
  }

  // 3) Duyệt theo thứ tự raw để dựng kết quả cuối:
  //    - keep: giữ nguyên
  //    - delete: thay bằng bản đã gắn charDiff nếu có
  //    - insert: bỏ qua nếu đã được ghép, giữ lại nếu chưa
  const resolvedWordDiffs: WordDiff[] = [];
  const usedInsertRawIndexes = new Set(
    [...usedInsertWordIndexes].map(
      (item) => insertWordDiffs[item]!.originalIndex,
    ),
  );

  for (let i = 0; i < rawWordDiffs.length; i++) {
    const wordDiff = rawWordDiffs[i]!;

    if (wordDiff.operation === "keep") {
      resolvedWordDiffs.push(wordDiff);
    } else if (wordDiff.operation === "delete") {
      resolvedWordDiffs.push(
        resolvedWordDiffByIndex.has(i)
          ? resolvedWordDiffByIndex.get(i)!
          : wordDiff,
      );
    } else if (wordDiff.operation === "insert") {
      if (!usedInsertRawIndexes.has(i)) {
        resolvedWordDiffs.push(wordDiff);
      }
    }
  }

  return resolvedWordDiffs;
}
