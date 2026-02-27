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

export const getCards = (cards: Card[], isIgnoreDate: boolean): Card[] => {
	return isIgnoreDate
		? structuredClone(cards)
		: cards.filter(
				(c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
			);
};
