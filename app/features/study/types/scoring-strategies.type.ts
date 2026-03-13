export type ScoringWord = {
	userWord: string;
	mostSimilarWord: string | null;
	similarity: number;
	isAccepted: boolean;
};

export type EditOperation = "keep" | "delete" | "insert";
export type DiffTokenType = "character" | "word";
export type DiffToken = {
	type: DiffTokenType;
	value: string;
	operation: EditOperation;
};
