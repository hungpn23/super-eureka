<script lang="ts" setup>
import { type TokenPairResponse, useAuthToasts, useUsers } from "~/features/auth";
import type { ErrorResponse } from "~/shared/types";

definePageMeta({
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

const route = useRoute();
const toast = useAuthToasts();
const users = useUsers();
const token = computed(() => route.query.token as string);
const { execute, data, error, pending } = useFetch<TokenPairResponse, ErrorResponse>(
	"/api/auth/verify-token",
	{
		method: "POST",
		query: { token },
		immediate: false,
		watch: false,
	},
);

onMounted(async () => {
	if (!token.value) return navigateTo("/login");

	await execute();

	if (error.value) {
		toast.verifyTokenFailed();
		await navigateTo("/login");
	}

	if (data.value) {
		await users.authenticate(data.value);
	}
});
</script>

<template>
  <UContainer class="flex h-screen place-content-center place-items-center">
    <div v-if="pending" class="flex flex-col place-items-center gap-4">
      <UIcon
        class="text-primary h-12 w-12 animate-spin"
        name="i-lucide-loader-2"
      />

      <h1 class="text-xl font-semibold">Verifying...</h1>
    </div>
  </UContainer>
</template>

<style scoped></style>
