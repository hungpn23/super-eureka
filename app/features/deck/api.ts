import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import type {
	CloneDeckOptions,
	DeleteDeckOptions,
	GetDeckOptions,
	GetDeckResponse,
	GetDecksOptions,
	GetDecksResponse,
	GetSharedDeckOptions,
	GetSharedDeckResponse,
	GetSharedDecksOptions,
	GetSharedDecksResponse,
	RestartDeckOptions,
	UpdateDeckOptions,
} from "./types";

class DeckApi {
	private readonly BASE_URL = "/api/decks";
	private readonly CLONE_DECK_URL = `${this.BASE_URL}/clone`;
	private readonly GET_SHARED_DECKS_URL = `${this.BASE_URL}/shared`;

	cloneDeck({ deckId, token, state }: CloneDeckOptions) {
		return useFetch<SuccessResponse, ErrorResponse>(
			computed(() => `${this.CLONE_DECK_URL}/${deckId.value}`),
			{
				method: "POST",
				headers: { Authorization: token.value || "" },
				body: state,
				immediate: false,
				watch: false,
			},
		);
	}

	getSharedDecks({ query, token }: GetSharedDecksOptions) {
		return useFetch<GetSharedDecksResponse, ErrorResponse>(
			this.GET_SHARED_DECKS_URL,
			{
				method: "GET",
				headers: { Authorization: token.value || "" },
				query,
			},
		);
	}

	getSharedDeck({ deckId, token }: GetSharedDeckOptions) {
		return useFetch<GetSharedDeckResponse, ErrorResponse>(
			computed(() => `${this.GET_SHARED_DECKS_URL}/${deckId.value}`),
			{
				method: "GET",
				headers: { Authorization: token.value || "" },
			},
		);
	}

	restartDeck({ deckId, token }: RestartDeckOptions) {
		return useFetch<SuccessResponse, ErrorResponse>(
			computed(() => `${this.BASE_URL}/restart/${deckId.value}`),
			{
				method: "POST",
				headers: { Authorization: token.value || "" },
				immediate: false,
				watch: false,
			},
		);
	}

	getDecks({ query, token }: GetDecksOptions) {
		return useFetch<GetDecksResponse, ErrorResponse>(this.BASE_URL, {
			method: "GET",
			headers: { Authorization: token.value || "" },
			query,
			lazy: true,
			server: false,
		});
	}

	getDeck({ deckId, token }: GetDeckOptions) {
		return useFetch<GetDeckResponse, ErrorResponse>(
			computed(() => `${this.BASE_URL}/${deckId.value}`),
			{
				method: "GET",
				headers: { Authorization: token.value || "" },
				server: false,
				immediate: false,
				watch: false,

				onResponseError: () => {
					showError({
						statusCode: 404,
						statusMessage: "Page Not Found",
					});
				},
			},
		);
	}

	deleteDeck({ deckId, token }: DeleteDeckOptions) {
		return useFetch<SuccessResponse, ErrorResponse>(
			computed(() => `${this.BASE_URL}/${deckId.value}`),
			{
				method: "DELETE",
				headers: { Authorization: token.value || "" },
				immediate: false,
				watch: false,
			},
		);
	}

	updateDeck({ deckId, token, state }: UpdateDeckOptions) {
		return useFetch<SuccessResponse, ErrorResponse>(
			computed(() => `${this.BASE_URL}/${deckId.value}`),
			{
				method: "PATCH",
				headers: { Authorization: token.value || "" },
				body: state,
				immediate: false,
				watch: false,
			},
		);
	}
}

export const api = new DeckApi();
