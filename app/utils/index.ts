import { addDays, isAfter } from 'date-fns';

export const getVisibilityIcon = (visibility: Visibility) => {
  const icons: Record<Visibility, string> = {
    [Visibility.PUBLIC]: 'i-lucide-globe',
    [Visibility.PROTECTED]: 'i-lucide-globe-lock',
    [Visibility.PRIVATE]: 'i-lucide-lock',
  };

  return icons[visibility];
};

export const getVisibilityDesc = (visibility: Visibility) => {
  const desc: Record<Visibility, string> = {
    [Visibility.PUBLIC]: 'All other users can use this set',
    [Visibility.PROTECTED]: 'Only people with this passcode can use this set',
    [Visibility.PRIVATE]: 'Only you can view this set',
  };

  return desc[visibility];
};

export const getContentSeparator = (
  value: ContentSeparator,
  custom: string = '',
) => {
  switch (value) {
    case 'comma':
      return ',';
    case 'tab':
      return '\t';
    case 'custom':
      return custom;
    default:
      return null;
  }
};

export const getCardSeparator = (value: CardSeparator, custom: string = '') => {
  switch (value) {
    case 'new_line':
      return '\n';
    case 'semicolon':
      return ';';
    case 'custom':
      return custom;
    default:
      return null;
  }
};

export const getCardStatus = (reviewDate?: string): CardStatus => {
  const now = Date.now();

  if (!reviewDate) {
    return 'new';
  } else if (Date.parse(reviewDate) > now) {
    return 'known';
  } else {
    return 'learning';
  }
};

export const getCards = (cards: Card[], ignoreDate: boolean): Card[] => {
  return ignoreDate
    ? cards
    : cards.filter(
        (c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
      );
};

export const shuffleArray = <T>(array: T[]) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[random]] = [arr[random]!, arr[i]!];
  }

  return arr;
};

export const updateCard = (q: LearnQuestion, isCorrect: boolean) => {
  const { streak, reviewDate, ...rest } = q;
  const now = new Date();

  if (!isCorrect) {
    return {
      ...rest,
      streak: 0,
      reviewDate: now.toISOString(),
    };
  }

  const newStreak = streak + 1;

  const gap = Math.pow(2, newStreak - 1);

  const baseDate = reviewDate ? new Date(reviewDate) : now;

  const nextDate = addDays(baseDate, gap);

  const maxDate = addDays(now, 30);

  const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

  return {
    ...rest,
    streak: newStreak,
    reviewDate: finalDate.toISOString(),
  };
};
