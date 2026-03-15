// ─────────────────────────────────────────────────────────────
// getTokenDifferences
// So sánh 2 mảng token (ký tự hoặc từ) bằng LCS traceback,
// trả về danh sách DiffToken với trạng thái:
//   "keep"   → token đúng, giữ nguyên
//   "delete" → token thừa trong input (cần xóa)
//   "insert" → token thiếu trong input (cần thêm vào)
// ─────────────────────────────────────────────────────────────

import type { CharDiff, TokenDiff, TokenType, WordDiff } from "../../types";
import { buildLCSTable } from "./buildLCSTable";

export function getTokenDifferences(
  inputTokens: string[],
  correctTokens: string[],
  tokenType: "word",
): WordDiff[];

export function getTokenDifferences(
  inputTokens: string[],
  correctTokens: string[],
  tokenType: "character",
): CharDiff[];

export function getTokenDifferences(
  inputTokens: string[],
  correctTokens: string[],
  tokenType: TokenType,
): TokenDiff[] {
  const lcsTable = buildLCSTable(inputTokens, correctTokens);

  const tokenDiffs: TokenDiff[] = [];

  // traceback lcs table
  let inputPos = inputTokens.length;
  let correctPos = correctTokens.length;

  while (inputPos > 0 || correctPos > 0) {
    const inputHasToken = inputPos > 0;
    const correctHasToken = correctPos > 0;
    const inputValue = inputHasToken ? inputTokens[inputPos - 1] : undefined;
    const correctValue = correctHasToken
      ? correctTokens[correctPos - 1]
      : undefined;
    const isSameValue = inputValue === correctValue;

    if (inputHasToken && correctHasToken && isSameValue) {
      // token giống nhau → giữ nguyên, lùi chéo
      tokenDiffs.unshift({
        type: tokenType,
        value: inputValue!,
        operation: "keep",
      });
      inputPos--;
      correctPos--;
    } else if (!inputHasToken && correctHasToken) {
      // input hết token → insert phần còn lại
      tokenDiffs.unshift({
        type: tokenType,
        value: correctValue!,
        operation: "insert",
      });
      correctPos--;
    } else if (inputHasToken && !correctHasToken) {
      // correct hết token → delete phần dư
      tokenDiffs.unshift({
        type: tokenType,
        value: inputValue!,
        operation: "delete",
      });
      inputPos--;
    } else {
      // cả input và corret đều còn tokens và khác value
      const leftCell = lcsTable[inputPos]![correctPos - 1]!;
      const topCell = lcsTable[inputPos - 1]![correctPos]!;
      const leftHasBetterLCS = leftCell >= topCell;

      if (leftHasBetterLCS) {
        // input đang thiếu token này → insert
        tokenDiffs.unshift({
          type: tokenType,
          value: correctValue!,
          operation: "insert",
        });
        correctPos--;
      } else {
        // input đang thừa token này → delete
        tokenDiffs.unshift({
          type: tokenType,
          value: inputValue!,
          operation: "delete",
        });
        inputPos--;
      }
    }
  }

  return tokenDiffs;
}
