import type { CreateCardSchema } from "./types";

export const getNewCard = (): CreateCardSchema => ({
	term: "",
	definition: "",
	termLanguage: "en",
	definitionLanguage: "vi",
	examples: [""],
});
