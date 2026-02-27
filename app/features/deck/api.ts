import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import type { CloneDeckOptions, GetSharedDecksResponse } from "./types";

class DeckApi {
	private readonly BASE_URL = "/api/decks";
	private readonly CLONE_DECK_URL = `${this.BASE_URL}/clone`;
	private readonly GET_SHARED_DECKS_URL = `${this.BASE_URL}/shared`;

	cloneDeck({ deckId, token, state }: CloneDeckOptions) {
		return useFetch<SuccessResponse, ErrorResponse>(
			`${this.CLONE_DECK_URL}/${deckId.value}`,
			{
				method: "POST",
				headers: { Authorization: token.value || "" },
				body: state,
				immediate: false,
			},
		);
	}

	getSharedDecks(query: ComputedRef, token: Ref<string | null>) {
		return useFetch<GetSharedDecksResponse, ErrorResponse>(
			this.GET_SHARED_DECKS_URL,
			{
				method: "GET",
				headers: { Authorization: token.value || "" },
				query,
			},
		);
	}
}

export const api = new DeckApi();
