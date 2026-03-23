<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import { pickFields } from "~/features/auth";
import { ERROR_MESSAGES } from "~/shared/constants";
import type { ErrorResponse, SuccessResponse } from "~/shared/types";
import { AUTH_SCHEMA } from "~/valibot/schemas";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/library",
	},
});

const schema = v.pick(AUTH_SCHEMA, ["email"]);
const toast = useToast();
const email = ref("");
const { execute, status, data, error } = useFetch<
	SuccessResponse,
	ErrorResponse
>("/api/auth/magic-link", {
	method: "POST",
	body: { email },
	immediate: false,
	watch: false,
});

async function handleSubmit(
	payload: FormSubmitEvent<v.InferOutput<typeof schema>>,
) {
	email.value = payload.data.email;
	await execute();

	if (error.value) {
		toast.add({
			title: "Failed to login with email",
			description: error.value.data?.message || ERROR_MESSAGES.UNKNOWN,
			color: "error",
		});
		return;
	}

	if (data.value?.success) {
		toast.add({
			title: "We've sent you a login link!",
			description: "Please check your email for the login link.",
			color: "success",
		});
		return;
	}
}
</script>

<template>
	<UAuthForm
		v-if="status !== 'success'"
		:fields="pickFields(['email'])"
		:schema="schema"
		title="Sign in with Email"
		@submit="handleSubmit"
	>
		<template #description>
			Don't have an account?
			<ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
		</template>
	</UAuthForm>

	<UContainer v-else class="sm:px-0 lg:px-0 px-0">
		<div class="flex place-items-center place-content-between gap-4">
			<UIcon name="i-lucide-circle-check-big" class="text-success size-10" />

			<div class="flex flex-col gap-2">
				<h1 class="font-medium">We've sent a login link to your email.</h1>
				<p class="text-sm text-muted-foreground">
					You can safely close this page.
				</p>
			</div>
		</div>
	</UContainer>
</template>
