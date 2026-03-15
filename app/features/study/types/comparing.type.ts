export type TokenDiff = WordDiff | CharDiff;

export type WordDiff = {
	type: Extract<TokenType, "word">;
	value: string;
	operation: EditOperation;
	charDiff?: CharDiff[];
};

export type CharDiff = {
	type: Extract<TokenType, "character">;
	value: string;
	operation: EditOperation;
};

export type EditOperation = "keep" | "delete" | "insert";
export type TokenType = "character" | "word";
