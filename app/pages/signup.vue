<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started',
});

const toast = useToast();
const { signUp } = useAuth();

const fields = [
  {
    name: 'username',
    type: 'text' as const,
    label: 'Username',
    placeholder: 'Enter your username',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password' as const,
    placeholder: 'Enter your confirm password',
  },
];

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: 'Login with Google' });
    },
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' });
    },
  },
];

const schema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(6, 'Must be at least 6 characters'),
      v.maxLength(20, 'Must be at most 20 characters'),
    ),
    password: v.message(
      v.pipe(
        v.string(),
        v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
      ),
      'Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.',
    ),
    confirmPassword: v.pipe(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      'Passwords do not match',
    ),
    ['confirmPassword'],
  ),
);

type Schema = v.InferOutput<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await signUp(payload.data, { callbackUrl: '/' });
  } catch (error) {
    toast.add({
      title: 'Sign up failed',
      description: JSON.stringify((error as ErrorResponse).data),
    });
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
