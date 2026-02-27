import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import type {
	ConfirmEmailVerificationResponse,
	SignUpState,
	TokenPairResponse,
} from "./types";

export class AuthApi {
	private readonly BASE_URL = "/api/auth";
	private readonly MAGIC_LINK_URL = `${this.BASE_URL}/magic-link`;
	private readonly VERIFY_TOKEN_URL = `${this.BASE_URL}/verify-token`;
	private readonly EMAIL_VERIFICATION_URL =
		`${this.BASE_URL}/email-verification`;
	private readonly SIGN_UP_URL = `${this.BASE_URL}/sign-up`;

	requestMagicLink(email: Ref<string>) {
		return useFetch<SuccessResponse, ErrorResponse>(this.MAGIC_LINK_URL, {
			method: "POST",
			body: { email },
			immediate: false,
		});
	}

	verifyToken(token: Ref<string>) {
		return useFetch<TokenPairResponse, ErrorResponse>(this.VERIFY_TOKEN_URL, {
			method: "POST",
			query: { token },
			immediate: false,
		});
	}

	requestEmailVerification(state: SignUpState) {
		return useFetch<SuccessResponse, ErrorResponse>(
			`${this.EMAIL_VERIFICATION_URL}/request`,
			{
				method: "POST",
				body: computed(() => ({ email: state.email })),
				immediate: false,
			},
		);
	}

	confirmEmailVerification(state: SignUpState) {
		return useFetch<ConfirmEmailVerificationResponse, ErrorResponse>(
			`${this.EMAIL_VERIFICATION_URL}/confirm`,
			{
				method: "POST",
				body: computed(() => ({ email: state.email, otp: state.otp })),
				immediate: false,
			},
		);
	}

	signUp(state: SignUpState) {
		return useFetch<TokenPairResponse, ErrorResponse>(this.SIGN_UP_URL, {
			method: "POST",
			body: computed(() => ({
				verifiedToken: state.verifiedToken,
				username: state.username,
				password: state.password,
			})),
			immediate: false,
		});
	}
}

export const api = new AuthApi();
