import { getDate } from 'date-fns';

export const learningQuotes = [
  {
    text: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
  },
  {
    text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: 'Dr. Seuss',
  },
  {
    text: 'Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young.',
    author: 'Henry Ford',
  },
  {
    text: 'Learning never exhausts the mind.',
    author: 'Leonardo da Vinci',
  },
  {
    text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'Change is the end result of all true learning.',
    author: 'Leo Buscaglia',
  },
  {
    text: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'The roots of education are bitter, but the fruit is sweet.',
    author: 'Aristotle',
  },
  {
    text: 'Develop a passion for learning. If you do, you will never cease to grow.',
    author: "Anthony J. D'Angelo",
  },
  {
    text: "You don't understand anything until you learn it more than one way.",
    author: 'Marvin Minsky',
  },
  {
    text: "It is not that I'm so smart. But I stay with the questions much longer.",
    author: 'Albert Einstein',
  },
  {
    text: 'I am still learning.',
    author: 'Michelangelo',
  },
  {
    text: 'Wisdom is not a product of schooling but of the lifelong attempt to acquire it.',
    author: 'Albert Einstein',
  },
] as const;

export function getDailyQuote() {
  const currentDayInMonth = getDate(new Date());
  const index = currentDayInMonth % learningQuotes.length;

  return learningQuotes[index];
}
