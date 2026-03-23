import type { QuestionDirection, QuestionType } from "../study";

export const QUESTION_DIRECTION_ITEMS = [
	{
		label: "Term to Definition",
		value: "term_to_def" satisfies QuestionDirection,
	},
	{
		label: "Definition to Term",
		value: "def_to_term" satisfies QuestionDirection,
	},
	{
		label: "Both",
		value: "both" satisfies QuestionDirection,
	},
];

export const QUESTION_TYPE_ITEMS = [
	{
		label: "Multiple Choices",
		value: "multiple_choices" satisfies QuestionType,
	},
	{
		label: "Written",
		value: "written" satisfies QuestionType,
	},
];

export const DECK_FILTER_ITEMS = [
	{
		id: "recently",
		label: "Recently",
	},
	{
		id: "newest",
		label: "Newest",
	},
	{
		id: "oldest",
		label: "Oldest",
	},
	{
		id: "name_az",
		label: "Name A-Z",
	},
	{
		id: "name_za",
		label: "Name Z-A",
	},
];

export const USER_STATS_ITEMS = [
	{
		title: "Streak",
		icon: "i-lucide-flame",
		color: "warning" as const,
		value: "",
		bonus: "",
	},
	{
		title: "Cards Learned",
		icon: "i-lucide-target",
		color: "info" as const,
		value: "",
		bonus: "",
	},
	{
		title: "Mastery Rate",
		icon: "i-lucide-book-marked",
		color: "success" as const,
		value: "",
		bonus: "",
	},
];
