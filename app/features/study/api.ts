import type { ErrorResponse, SuccessResponse, UUID } from "~/shared/types";
import type { CardToSave } from "../card";
import type { UserStats } from "../user";

export type SaveAnswersPayload = { answers: CardToSave[] };

export type SaveAnswersOptions = {
  deckId: UUID | null;
  token: Ref<string | null>;
  payload: Ref<SaveAnswersPayload>;
};

class StudyApi {
  private readonly BASE_URL = "/api/study";
  private readonly GET_STATS_URL = `${this.BASE_URL}/stats`;

  getStats(token: Ref<string | null>) {
    return useFetch<UserStats, ErrorResponse>(this.GET_STATS_URL, {
      method: "GET",
      headers: { Authorization: token.value || "" },
    });
  }

  saveAnswers({ deckId, token, payload }: SaveAnswersOptions) {
    return useFetch<SuccessResponse, ErrorResponse>(
      `${this.BASE_URL}/save-answers/${deckId}`,
      {
        method: "POST",
        headers: { Authorization: token.value || "" },
        body: payload,
        immediate: false,
        watch: false,
      },
    );
  }
}

export const api = new StudyApi();
