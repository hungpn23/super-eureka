import type { QuestionDirection, QuestionType } from "~/features/card";

export const questionDirectionItems = [
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

export const questionTypeItems = [
	{
		label: "Multiple Choices",
		value: "multiple_choices" satisfies QuestionType,
	},
	{
		label: "Written",
		value: "written" satisfies QuestionType,
	},
];

export const deckFilterItems = [
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

export const userStatsItems = [
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

export const profileTabItems = [
	{
		label: "Decks",
		icon: "i-lucide-book",
	},
	{
		label: "Posts",
		icon: "i-lucide-pen-line",
	},
];

export const magicLinkFields = [
	{
		name: "email",
		type: "email" as const,
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
];

export const logInFields = [
	...magicLinkFields,
	{
		name: "password",
		label: "Password",
		type: "password" as const,
		placeholder: "Enter your password",
		required: true,
	},
];

export const signUpFields = [
	...logInFields,
	{
		name: "confirmPassword",
		label: "Confirm password",
		type: "password" as const,
		placeholder: "Enter your confirm password",
		required: true,
	},
];
