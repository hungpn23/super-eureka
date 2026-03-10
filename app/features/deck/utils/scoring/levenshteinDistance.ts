export function levenshteinDistance(userInput: string, correctAnswer: string) {
	const rowCount = userInput.length;
	const columnCount = correctAnswer.length;

	// init dp table
	const table: number[][] = Array.from({ length: rowCount }, () =>
		new Array(columnCount).fill(0),
	);

	// fill in first col: number of "delete" operations
	for (let i = 0; i < rowCount; i++) {
		table[i]![0] = i;
	}

	// fill in first row: number of "add" operations
	for (let j = 0; j < columnCount; j++) {
		table[0]![j] = j;
	}

	// fill dp table, left to right, top to bottom
	for (let i = 1; i < rowCount; i++) {
		for (let j = 1; j < columnCount; j++) {
			const replaceCost = userInput[i - 1] === correctAnswer[j - 1] ? 0 : 1;

			table[i]![j] = Math.min(
				table[i - 1]![j]! + 1, // delete operation
				table[i]![j - 1]! + 1, // add operation
				table[i - 1]![j - 1]! + replaceCost, // replace operation
			);
		}
	}

	return table[rowCount - 1]![columnCount - 1]!;
}
