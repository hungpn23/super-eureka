import type { Card } from "~/features/card";
import { Visibility } from "~/features/deck";

export const getVisibilityIcon = (visibility: Visibility) => {
  const icons: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "i-lucide-globe",
    [Visibility.PROTECTED]: "i-lucide-globe-lock",
    [Visibility.PRIVATE]: "i-lucide-lock",
  };

  return icons[visibility];
};

export const getCards = (cards: Card[]): Card[] => {
  return cards.filter(
    (c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
  );
};

export const focusInput = (
  inputRef?: HTMLInputElement | HTMLTextAreaElement | null,
  delay = 1,
) => {
  setTimeout(() => inputRef?.focus(), delay);
};

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}'\s-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/\s-\s/g, "-")
    .trim();
}

export const shuffleArray = <T>(array: T[]) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[random]] = [arr[random]!, arr[i]!];
  }

  return arr;
};
