<script setup lang="ts">
import type { ToasterProps } from "@nuxt/ui";

const toaster: ToasterProps = {
	duration: 3000,
	position: "top-right",
	expand: false,
};

const ioStore = useSocketIOStore();
const notificationStore = useNotificationStore();
const colorMode = useColorMode();

const color = computed(() =>
	colorMode.value === "dark" ? "#020618" : "white",
);

useHead({
	meta: [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
		{ key: "theme-color", name: "theme-color", content: color },
	],
	htmlAttrs: {
		lang: "en",
	},
});

onMounted(() => {
	ioStore.setup();
	notificationStore.setup();
});

onUnmounted(() => {
	ioStore.teardown();
	notificationStore.teardown();
});
</script>

<template>
	<UApp :toaster="toaster">
		<NuxtLoadingIndicator />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
