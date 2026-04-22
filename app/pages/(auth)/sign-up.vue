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
	<div class="flex flex-col items-center gap-6 p-6 sm:p-8">
		<div
			class="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500/20 to-secondary-500/10 ring ring-primary/30"
		>
			<UIcon
				:name="
					state.isEmailVerified
						? 'i-lucide-user-plus'
						: state.isRequested
							? 'i-lucide-mail-check'
							: 'i-lucide-mail'
				"
				class="size-7 text-primary"
			/>
		</div>

		<!-- Step indicator -->
		<ol class="flex w-full items-center gap-2">
			<li
				v-for="(step, idx) in [
					{ label: 'Email', done: state.isRequested },
					{ label: 'Verify', done: state.isEmailVerified },
					{ label: 'Account', done: false },
				]"
				:key="step.label"
				class="flex flex-1 items-center gap-2"
			>
				<div
					class="flex size-6 items-center justify-center rounded-full text-xs font-semibold ring"
					:class="
						step.done ||
						(idx === 0 && !state.isRequested) ||
						(idx === 1 && state.isRequested && !state.isEmailVerified) ||
						(idx === 2 && state.isEmailVerified)
							? 'bg-primary text-inverted ring-primary'
							: 'bg-elevated text-muted ring-default'
					"
				>
					<UIcon v-if="step.done" name="i-lucide-check" class="size-3.5" />
					<span v-else>{{ idx + 1 }}</span>
				</div>
				<span
					class="text-xs font-medium"
					:class="step.done ? 'text-default' : 'text-muted'"
				>
					{{ step.label }}
				</span>
				<USeparator
					v-if="idx < 2"
					class="flex-1"
					:ui="{ border: step.done ? 'border-primary/40' : 'border-default' }"
				/>
			</li>
		</ol>

		<UAuthForm
			v-if="state.isRequested && state.isEmailVerified"
			:fields="pickFields(['username', 'password', 'confirmPassword'])"
			:schema="schema"
			title="Create your account"
			description="Pick a username and a strong password."
			:submit="{ label: 'Create account', trailingIcon: 'i-lucide-arrow-right' }"
			class="w-full"
			:ui="{
				title: 'text-center text-2xl font-bold',
				description: 'text-center',
				header: 'p-0',
				root: 'gap-5',
			}"
			@submit="handleSignUpSubmit"
		>
			<template #footer>
				<p class="text-muted w-full text-center text-sm">
					Already have an account?
					<ULink to="/login" class="text-primary font-medium">Login</ULink>
				</p>
			</template>
		</UAuthForm>

		<UAuthForm
			v-else-if="state.isRequested"
			:fields="pickFields(['otp'])"
			:schema="otpSchema"
			title="Check your inbox"
			:submit="{ label: 'Verify email', trailingIcon: 'i-lucide-arrow-right' }"
			class="w-full"
			:ui="{
				title: 'text-center text-2xl font-bold',
				description: 'text-center',
				header: 'p-0',
				root: 'gap-5',
			}"
			@submit="handleOtpSubmit"
		>
			<template #description>
				We've sent a 6-digit code to
				<span class="text-default font-medium">{{ state.email }}</span>
			</template>

			<template #footer>
				<p class="text-muted w-full text-center text-sm">
					Already have an account?
					<ULink to="/login" class="text-primary font-medium">Login</ULink>
				</p>
			</template>
		</UAuthForm>

		<UAuthForm
			v-else
			:fields="pickFields(['email'])"
			:schema="emailSchema"
			title="Sign up to Vocabify"
			description="Enter your email — we'll send you a verification code."
			:submit="{ label: 'Send code', trailingIcon: 'i-lucide-arrow-right' }"
			class="w-full"
			:ui="{
				title: 'text-center text-2xl font-bold',
				description: 'text-center',
				header: 'p-0',
				root: 'gap-5',
			}"
			@submit="handleEmailSubmit"
		>
			<template #footer>
				<p class="text-muted w-full text-center text-sm">
					Already have an account?
					<ULink to="/login" class="text-primary font-medium">Login</ULink>
				</p>
			</template>
		</UAuthForm>

		<div class="text-muted flex items-center gap-1.5 text-xs">
			<UIcon name="i-lucide-shield-check" class="text-success size-3.5" />
			<span>Free forever · No credit card required</span>
		</div>
	</div>
</template>
