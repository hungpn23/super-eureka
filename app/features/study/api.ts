import type { ErrorResponse } from "~/shared/types";
import type { UserStats } from "../user";

class StudyApi {
	private readonly BASE_URL = "/api/study";
	private readonly GET_STATS_URL = `${this.BASE_URL}/stats`;

	getStats(token: Ref<string | null>) {
		return useFetch<UserStats, ErrorResponse>(this.GET_STATS_URL, {
			method: "GET",
			headers: { Authorization: token.value || "" },
		});
	}
}

export const api = new StudyApi();
