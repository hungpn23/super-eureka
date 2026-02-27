<script lang="ts" setup>
import { useAuthToasts, useUsers } from "~/features/auth";
import { api } from "~/shared/apis";

definePageMeta({
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

const route = useRoute();
const router = useRouter();
const toast = useAuthToasts();
const users = useUsers();
const token = computed(() => route.query.token as string);
const { execute, data, error, pending } = api.auth.verifyToken(token);

onMounted(async () => {
	if (!token.value) return router.push("/login");

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
