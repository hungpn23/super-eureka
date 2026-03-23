<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import {
	type ConfirmEmailVerificationResponse,
	pickFields,
	type SignUpState,
	type TokenPairResponse,
	useAuthToasts,
	useUsers,
} from "~/features/auth";
import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import { AUTH_SCHEMA } from "~/valibot/schemas";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/library",
	},
});

const emailSchema = v.pick(AUTH_SCHEMA, ["email"]);
const otpSchema = v.pick(AUTH_SCHEMA, ["otp"]);
const schema = v.pipe(
	v.pick(AUTH_SCHEMA, ["username", "password", "confirmPassword"]),
	v.forward(
		v.partialCheck(
			[["password"], ["confirmPassword"]],
			(input) => input.password === input.confirmPassword,
			"Passwords do not match",
		),
		["confirmPassword"],
	),
);
const users = useUsers();
const toast = useAuthToasts();
const state = reactive<SignUpState>({
	email: "",
	otp: "",
	username: "",
	password: "",
	isRequested: false,
	isEmailVerified: false,
	verifiedToken: "",
});

const requestMutation = useFetch<SuccessResponse, ErrorResponse>(
	"/api/auth/email-verification/request",
	{
		method: "POST",
		body: computed(() => ({ email: state.email })),
		immediate: false,
		watch: false,
	},
);

const confirmMutation = useFetch<
	ConfirmEmailVerificationResponse,
	ErrorResponse
>("/api/auth/email-verification/confirm", {
	method: "POST",
	body: computed(() => ({ email: state.email, otp: state.otp })),
	immediate: false,
	watch: false,
});

const signUpMutation = useFetch<TokenPairResponse, ErrorResponse>(
	"/api/auth/sign-up",
	{
		method: "POST",
		body: computed(() => ({
			verifiedToken: state.verifiedToken,
			username: state.username,
			password: state.password,
		})),
		immediate: false,
		watch: false,
	},
);

async function handleEmailSubmit(
	payload: FormSubmitEvent<v.InferOutput<typeof emailSchema>>,
) {
	state.email = payload.data.email;
	await requestMutation.execute();

	if (requestMutation.data.value?.success) {
		state.isRequested = true;
	}

	if (requestMutation.error.value) {
		toast.signUpFailed();
	}
}

async function handleOtpSubmit(
	payload: FormSubmitEvent<v.InferOutput<typeof otpSchema>>,
) {
	state.otp = payload.data.otp.join("");
	await confirmMutation.execute();

	if (confirmMutation.data.value?.verifiedToken) {
		state.isEmailVerified = true;
		state.verifiedToken = confirmMutation.data.value.verifiedToken;
	}

	if (confirmMutation.error.value) {
		toast.signUpFailed();
	}
}

async function handleSignUpSubmit(
	payload: FormSubmitEvent<v.InferOutput<typeof schema>>,
) {
	state.username = payload.data.username;
	state.password = payload.data.password;
	await signUpMutation.execute();

	if (signUpMutation.data.value) {
		await users.authenticate(signUpMutation.data.value);
	}

	if (signUpMutation.error.value) {
		toast.signUpFailed();
	}
}
</script>

<template>
	<UAuthForm
		v-if="state.isRequested && state.isEmailVerified"
		:fields="pickFields(['username', 'password', 'confirmPassword'])"
		:schema="schema"
		title="Sign up to Vocabify"
		description="Let's create your account"
		@submit="handleSignUpSubmit"
	>
		<template #footer>
			Already have an account?
			<ULink to="/login" class="text-primary font-medium">Login</ULink>
		</template>
	</UAuthForm>

	<UAuthForm
		v-else-if="state.isRequested"
		:fields="pickFields(['otp'])"
		:schema="otpSchema"
		title="Sign up to Vocabify"
		description="Let's verify your email"
		@submit="handleOtpSubmit"
	>
		<template #footer>
			Already have an account?
			<ULink to="/login" class="text-primary font-medium">Login</ULink>
		</template>
	</UAuthForm>

	<UAuthForm
		v-else
		:fields="pickFields(['email'])"
		:schema="emailSchema"
		title="Sign up to Vocabify"
		description="Let's verify your email"
		@submit="handleEmailSubmit"
	>
		<template #footer>
			Already have an account?
			<ULink to="/login" class="text-primary font-medium">Login</ULink>
		</template>
	</UAuthForm>
</template>
