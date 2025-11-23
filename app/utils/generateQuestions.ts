import type { Question } from '~~/shared/types/card';
import { QuestionDirection, QuestionType } from './enums/question';

export default (
  cards: Card[],
  types: QuestionType[],
  dir: QuestionDirection,
): Question[] => {
  const questions: Question[] = [];

  for (const { id, ...c } of cards) {
    const random = Math.random();
    const type = types[Math.floor(random * types.length)]!;

    let direction: QuestionDirection;
    if (dir === QuestionDirection.BOTH) {
      direction =
        random < 0.5
          ? QuestionDirection.TERM_TO_DEF
          : QuestionDirection.DEF_TO_TERM;
    } else {
      direction = dir;
    }

    const isTermToDef = direction === QuestionDirection.TERM_TO_DEF;

    let question: string;
    let answer: string;
    if (isTermToDef) {
      question = c.term;
      answer = c.definition;
    } else {
      question = c.definition;
      answer = c.term;
    }

    let choices: string[] | undefined;
    if (type === QuestionType.MULTIPLE_CHOICES) {
      const result = [answer];

      const others = cards.filter((c) => c !== c);
      const shuffledOthers = shuffle(others);

      for (let i = 0; i < 3; i++) {
        const distractor = shuffledOthers[i];

        const distractorAnswer = isTermToDef
          ? distractor.definition
          : distractor.term;

        result.push(distractorAnswer);
      }

      choices = shuffle(result);
    }

    questions.push({ id, type, direction, question, answer, choices });
  }

  return questions;
};
