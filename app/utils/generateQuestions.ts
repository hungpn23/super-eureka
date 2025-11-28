export const generateQuestions = <
  T extends LearnQuestion | TestQuestion,
>(options: {
  cards: Card[];
  types: QuestionType[];
  dir: QuestionDirection;
  answerPool: Pick<Card, 'id' | 'term' | 'definition'>[];
}): T[] => {
  const { cards, types, dir, answerPool } = options;
  if (answerPool.length < 4) return [];

  const questions: T[] = [];

  for (const card of cards) {
    const random = Math.random();
    const type = types[Math.floor(random * types.length)]!;

    let direction: QuestionDirection;
    if (dir === 'both') {
      direction = random < 0.5 ? 'term_to_def' : 'def_to_term';
    } else {
      direction = dir;
    }

    const isTermToDef = direction === 'term_to_def';

    let question: string;
    let answer: string;
    if (isTermToDef) {
      question = card.term;
      answer = card.definition;
    } else {
      question = card.definition;
      answer = card.term;
    }

    let choices: string[] | undefined;
    let correctChoiceIndex: number | undefined;
    if (type === 'multiple_choices') {
      const result = [answer];

      const wrongAnswers = shuffleArray(
        answerPool.filter((c) => c.id !== card.id),
      );

      for (let i = 0; i < 3; i++) {
        const wrongAnswer = isTermToDef
          ? wrongAnswers[i]!.definition
          : wrongAnswers[i]!.term;

        result.push(wrongAnswer);
      }

      choices = shuffleArray(result);
      correctChoiceIndex = choices.indexOf(answer);
    }

    questions.push({
      id: card.id,
      streak: card.streak,
      reviewDate: card.reviewDate,
      type,
      direction,
      question,
      correctAnswer: answer,
      choices,
      correctChoiceIndex,
    } as T);
  }

  return questions;
};
