export type SentenceEvaluationResult = "correct" | "almost" | "incorrect";
export type EditOperation = "keep" | "delete" | "insert";
export type DiffTokenType = "character" | "word";

export type DiffToken = {
	type: DiffTokenType;
	value: string;
	operation: EditOperation;
};
