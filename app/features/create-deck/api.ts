import type { ErrorResponse } from "~/shared/types";
import type { CreateDeckOptions, CreateDeckResponse } from "./types";

class CreateDeckApi {
	private readonly BASE_URL = "/api/decks";

	createDeck({ data, token }: CreateDeckOptions) {
		return useFetch<CreateDeckResponse, ErrorResponse>(this.BASE_URL, {
			method: "POST",
			headers: { Authorization: token.value || "" },
			body: data,
			immediate: false,
		});
	}
}

export const api = new CreateDeckApi();
