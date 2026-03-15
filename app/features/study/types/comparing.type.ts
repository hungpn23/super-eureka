export type TokenDiff = WordDiff | CharDiff;

export type WordDiff = {
  type: Extract<TokenType, "word">;
  value: string;
  operation: WordOperation;
  charDiff?: CharDiff[];
};

export type CharDiff = {
  type: Extract<TokenType, "character">;
  value: string;
  operation: CharOperation;
};

export type CharOperation = "keep" | "delete" | "insert";
export type WordOperation = CharOperation | "replace";
export type TokenType = "character" | "word";
