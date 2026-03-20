import type { CardToSave } from "~/features/card";

export type QuestionType = "multiple_choices" | "written";
export type QuestionDirection = "term_to_def" | "def_to_term" | "both";
export type SaveAnswersPayload = { answers: CardToSave[] };
