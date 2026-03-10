import { getDate } from "date-fns";
import { QUOTES } from "../../constants";

export function getDailyQuote() {
	const currentDayInMonth = getDate(new Date());
	const index = currentDayInMonth % QUOTES.length;

	return QUOTES[index];
}
