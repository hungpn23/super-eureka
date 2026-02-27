export type CardSuggestion = {
	currentCardIndex: number;
	definition: string;
	pronunciation?: string;
	partOfSpeech?: string;
	usageOrGrammar?: string;
	examples: string[];
};
