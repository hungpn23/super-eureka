import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";
import type { TokenPairResponse } from "./types";

export const useAuthToasts = () => {
	const toast = useToast();

	return {
		loginSuccess: (username?: string) => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: `Welcome back, ${username}.`,
				description: "You have successfully logged in.",
			});
		},
		loginFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Login failed.",
				description: "Please check your credentials and try again.",
			});
		},
		signUpSuccess: (username?: string) => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: `Welcome to Vocabify, ${username}.`,
				description: "You have successfully signed up.",
			});
		},
		signUpFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Sign up failed.",
				description: "Please check your credentials and try again.",
			});
		},
		requestMagicLinkSuccess: (email: string) => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "We've sent you a login link!",
				description: `Please check your email ${email} for the login link.`,
			});
		},
		requestMagicLinkFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to send login link.",
				description: `Please check your email and try again.`,
			});
		},
		verifyTokenFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to verify token.",
			});
		},
	};
};

export const useUsers = () => {
	const auth = useAuth();
	const authState = useAuthState();
	const toast = useAuthToasts();

	const authenticate = async (tokenPair: TokenPairResponse) => {
		authState.setToken(tokenPair.accessToken);
		authState.rawRefreshToken.value = tokenPair.refreshToken;
		const session = await auth.getSession();
		await navigateTo("/library");
		toast.loginSuccess(session?.username);
	};

	return {
		authenticate,
	};
};
