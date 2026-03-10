export type MatchedWordPair = {
	userWord: string;
	mostSimilarWord: string | null;
	similarity: number;
	isMatched: boolean;
};
