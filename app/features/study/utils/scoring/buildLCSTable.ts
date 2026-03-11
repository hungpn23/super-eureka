/**
 * @description build a Longest Common Subsequence table
 */
export function buildLCSTable(firstString: string, secondString: string) {
	// init dp table
	const table: number[][] = Array.from({ length: firstString.length + 1 }, () =>
		new Array(secondString.length + 1).fill(0),
	);

	for (let i = 1; i <= firstString.length; i++) {
		for (let j = 1; j <= secondString.length; j++) {
			// check if last character of each sub string match
			const isMatch = firstString[i - 1] === secondString[j - 1];

			table[i]![j]! = isMatch
				? table[i - 1]![j - 1]! + 1
				: Math.max(table[i - 1]![j]!, table[i]![j - 1]!);
		}
	}

	return table;
}
