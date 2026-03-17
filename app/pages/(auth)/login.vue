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
  <UAuthForm
    :fields="pickFields(['email', 'password'])"
    :schema="schema"
    :providers="providerWithHandlers"
    title="Sign in to Vocabify"
    @submit.prevent="handleSubmit"
  >
    <template #password-hint>
      <ULink to="/" class="text-primary font-medium" tabindex="-1">
        Forgot password?
      </ULink>
    </template>

    <template #description>
      Don't have an account?
      <ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
    </template>
  </UAuthForm>
</template>
