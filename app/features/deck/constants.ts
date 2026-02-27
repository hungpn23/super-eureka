import * as v from "valibot";
import {
	type QuestionDirection,
	type QuestionType,
	UPDATE_CARD_SCHEMA,
} from "../card";

export const CLONE_DECK_SCHEMA = v.object({
	passcode: v.pipe(
		v.string(),
		v.minLength(4, "Passcode must be at least 4 characters"),
	),
});

export const UPDATE_DECK_SCHEMA = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required")),
	description: v.string(),
	cards: v.pipe(
		v.array(UPDATE_CARD_SCHEMA),
		v.minLength(4, "At least 4 cards are required"),
	),
});

export const LANGUAGE_CODES = ["en", "vi"] as const;

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

export const QUOTES = [
	{
		text: "The beautiful thing about learning is that no one can take it away from you.",
		author: "B.B. King",
	},
	{
		text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
		author: "Mahatma Gandhi",
	},
	{
		text: "Education is the most powerful weapon which you can use to change the world.",
		author: "Nelson Mandela",
	},
	{
		text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
		author: "Dr. Seuss",
	},
	{
		text: "Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young.",
		author: "Henry Ford",
	},
	{
		text: "Learning never exhausts the mind.",
		author: "Leonardo da Vinci",
	},
	{
		text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
		author: "Benjamin Franklin",
	},
	{
		text: "Change is the end result of all true learning.",
		author: "Leo Buscaglia",
	},
	{
		text: "An investment in knowledge pays the best interest.",
		author: "Benjamin Franklin",
	},
	{
		text: "The roots of education are bitter, but the fruit is sweet.",
		author: "Aristotle",
	},
	{
		text: "Develop a passion for learning. If you do, you will never cease to grow.",
		author: "Anthony J. D'Angelo",
	},
	{
		text: "You don't understand anything until you learn it more than one way.",
		author: "Marvin Minsky",
	},
	{
		text: "It is not that I'm so smart. But I stay with the questions much longer.",
		author: "Albert Einstein",
	},
	{
		text: "I am still learning.",
		author: "Michelangelo",
	},
	{
		text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
		author: "Albert Einstein",
	},
] as const;
