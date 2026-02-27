import type { FormSubmitEvent } from "@nuxt/ui";
import type {
	CreateCardSchema,
	CreateDeckSchema,
	ImportCardsSchema,
} from "./types";

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
