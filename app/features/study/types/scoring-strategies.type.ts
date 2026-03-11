export type ScoringWord = {
	userWord: string;
	mostSimilarWord: string | null;
	similarity: number;
	isAccepted: boolean;
};
