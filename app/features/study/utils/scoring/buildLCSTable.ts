/**
 * @description Build a Longest Common Subsequence (LCS) table for two token arrays.
 * Works for both character-level and word-level diffing.
 */
export function buildLCSTable(
	inputTokens: string[],
	correctTokens: string[],
): number[][] {
	const table: number[][] = Array.from(
		{ length: inputTokens.length + 1 },
		() => new Array(correctTokens.length + 1).fill(0),
	);

	for (let i = 1; i <= inputTokens.length; i++) {
		for (let j = 1; j <= correctTokens.length; j++) {
			const isMatch = inputTokens[i - 1] === correctTokens[j - 1];

			table[i]![j]! = isMatch
				? table[i - 1]![j - 1]! + 1
				: Math.max(table[i - 1]![j]!, table[i]![j - 1]!);
		}
	}

	return table;
}
