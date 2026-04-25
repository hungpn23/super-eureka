<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import {
	applyProviderHandlers,
	type GoogleQueryParams,
	pickFields,
	useAuthToasts,
} from "~/features/auth";
import { AUTH_SCHEMA } from "~/valibot/schemas";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/library",
	},
});

const schema = v.pick(AUTH_SCHEMA, ["email", "password"]);
const providerWithHandlers = applyProviderHandlers({
	google: handleLoginWithGoogle,
	"magic-link": () => navigateTo("/magic-link"),
});
const config = useRuntimeConfig();
const auth = useAuth();
const toast = useAuthToasts();

function handleLoginWithGoogle() {
	const scope = [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	].join(" ");

	const options: GoogleQueryParams = {
		redirect_uri: config.public.googleRedirectUri,
		client_id: config.public.googleClientId,
		response_type: "code",
		scope,
		prompt: "select_account",
	};

	const searchParams = new URLSearchParams(options).toString();

	window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams}`;
}

function handleSubmit(payload: FormSubmitEvent<v.InferOutput<typeof schema>>) {
	auth
		.signIn(payload.data, { callbackUrl: "/library" })
		.then(async () => {
			const session = await auth.getSession();
			toast.loginSuccess(session?.username);
		})
		.catch(toast.loginFailed);
}
</script>

<template>
	<div class="flex flex-col items-center gap-6 p-6 sm:p-8">
		<div
			class="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500/20 to-secondary-500/10 ring ring-primary/30"
		>
			<UIcon name="i-lucide-lock-keyhole" class="size-7 text-primary" />
		</div>

		<UAuthForm
			:fields="pickFields(['email', 'password'])"
			:schema="schema"
			:providers="providerWithHandlers"
			title="Welcome back"
			separator="or continue with email"
			:submit="{ label: 'Sign in', trailingIcon: 'i-lucide-arrow-right' }"
			class="w-full"
			:ui="{
				title: 'text-center text-2xl font-bold',
				description: 'text-center',
				header: 'p-0',
				root: 'gap-5',
			}"
			@submit.prevent="handleSubmit"
		>
			<template #description>
				Sign in to continue learning with Vocabify.
			</template>

			<template #password-hint>
				<ULink to="/" class="text-primary text-xs font-medium" tabindex="-1">
					Forgot password?
				</ULink>
			</template>

			<template #footer>
				<p class="text-muted w-full text-center text-sm">
					Don't have an account?
					<ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
				</p>
			</template>
		</UAuthForm>

		<div class="text-muted flex items-center gap-1.5 text-xs">
			<UIcon name="i-lucide-shield-check" class="text-success size-3.5" />
			<span>Secured with rotating JWTs</span>
		</div>
	</div>
</template>
