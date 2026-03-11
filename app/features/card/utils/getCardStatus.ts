import type { CardStatus } from "~/features/card";

export const getCardStatus = (reviewDate?: string | null): CardStatus => {
	const now = Date.now();

	if (!reviewDate) {
		return "new";
	} else if (Date.parse(reviewDate) > now) {
		return "known";
	} else {
		return "learning";
	}
};
