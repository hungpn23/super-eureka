import type { FormSubmitEvent } from "@nuxt/ui";
import type { ShallowRef } from "vue";
import type {
	CreateCardSchema,
	CreateDeckSchema,
	ImportCardsSchema,
} from "./types";

type TextareaRef = { textareaRef?: HTMLTextAreaElement | null } | null;

export function useCardSuggestion(
	definitionRef: Readonly<ShallowRef<TextareaRef[] | null>>,
) {
	const { token } = useAuth();

	const suggestion = reactive<CardSuggestion>({
		currentCardIndex: -1,
		definition: "",
		examples: [],
	});

	const debouncedGetCardSuggestion = useDebounceFn(
		async (card: CreateCardSchema, cardIndex: number) => {
			const { term, partOfSpeech, termLanguage, definitionLanguage } = card;

			$fetch<CardSuggestion>("/api/suggestion/term", {
				method: "POST",
				headers: { Authorization: token.value || "" },
				body: {
					term,
					partOfSpeech,
					termLanguage,
					definitionLanguage,
				},
			})
				.then((res) => {
					suggestion.currentCardIndex = cardIndex;
					suggestion.definition = res.definition;
					suggestion.pronunciation = res.pronunciation || "";
					suggestion.partOfSpeech = res.partOfSpeech || "";
					suggestion.usageOrGrammar = res.usageOrGrammar || "";
					suggestion.examples = res.examples.length ? res.examples : [""];
				})
				.catch(() => {});
		},
		500,
	);

	function isSuggestingThisCard(index: number) {
		return suggestion.currentCardIndex === index;
	}

	function hasSuggestion(card: CreateCardSchema) {
		return !card.definition && !!suggestion.definition;
	}

	function applySuggestion(card: CreateCardSchema, index: number) {
		if (!hasSuggestion(card)) return;

		card.definition = suggestion.definition;
		card.partOfSpeech = suggestion.partOfSpeech;
		card.pronunciation = suggestion.pronunciation;
		card.examples = suggestion.examples.length ? suggestion.examples : [""];

		definitionRef.value?.[index]?.textareaRef?.focus();
	}

	function isWord(term: string) {
		return !term.trim().includes(" ");
	}

	return {
		suggestion,
		debouncedGetCardSuggestion,
		isSuggestingThisCard,
		hasSuggestion,
		applySuggestion,
		isWord,
	};
}

export function useImportCards(createState: CreateDeckSchema) {
	const toast = useToast();

	const isImportModalOpen = ref(false);

	const importState = reactive({
		input: "",
		contentSeparator: "tab" as ContentSeparator,
		cardSeparator: "new_line" as CardSeparator,
		customContentSeparator: "-",
		customCardSeparator: "\\",
	});

	const contentSeparatorPreview = computed(
		() =>
			`Term${getContentSeparator(
				importState.contentSeparator,
				importState.customContentSeparator,
			)}Definition`,
	);

	const cardSeparatorPreview = computed(
		() =>
			`Card1${getCardSeparator(
				importState.cardSeparator,
				importState.customCardSeparator,
			)}Card2`,
	);

	const parsedCards = computed(() => {
		const sep = getContentSeparator(
			importState.contentSeparator,
			importState.customContentSeparator,
		);
		const cardSep = getCardSeparator(
			importState.cardSeparator,
			importState.customCardSeparator,
		);

		if (!importState.input || !sep || !cardSep) return [];

		const cards = importState.input
			.split(cardSep)
			.filter((card) => card.trim().length > 0);

		return cards.map((card) => {
			const [term = "", definition = ""] = card.split(sep);

			return { term, definition };
		});
	});

	async function onImportSubmit(event: FormSubmitEvent<ImportCardsSchema>) {
		const sep = getContentSeparator(
			importState.contentSeparator,
			importState.customContentSeparator,
		);

		const cardSep = getCardSeparator(
			importState.cardSeparator,
			importState.customCardSeparator,
		);

		if (!sep || !cardSep) return;

		const importCards = event.data.input
			.split(cardSep)
			.filter((card) => card.trim().length > 0)
			.map((card) => {
				const [term = "", definition = ""] = card.split(sep);

				const newCard: CreateCardSchema = {
					term,
					definition,
					termLanguage: "en",
					definitionLanguage: "vi",
					examples: [],
				};

				return newCard;
			});

		const currentCards = createState.cards.filter(
			(c) => c.term.trim().length > 0 || c.definition.trim().length > 0,
		);

		createState.cards = [...currentCards, ...importCards];

		isImportModalOpen.value = false;

		toast.add({ title: "Successfully imported!", color: "success" });
	}

	return {
		isImportModalOpen,
		importState,
		contentSeparatorPreview,
		cardSeparatorPreview,
		parsedCards,
		onImportSubmit,
	};
}
