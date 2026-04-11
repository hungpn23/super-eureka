<script setup lang="ts">
import VueCusdis from "vue-cusdis";

const props = withDefaults(
	defineProps<{
		pageId: string;
		pageTitle?: string | null;
		pageUrl?: string | null;
		lang?: string;
		theme?: string;
	}>(),
	{
		pageTitle: "",
		pageUrl: "",
		lang: undefined,
		theme: undefined,
	},
);

const config = useRuntimeConfig();
const route = useRoute();

const currentPageUrl = computed(() => {
	if (props.pageUrl) return props.pageUrl;
	if (import.meta.client) return window.location.href;

	return route.fullPath;
});

const attrs = computed(() => ({
	host: config.public.cusdisHost,
	appId: config.public.cusdisAppId,
	pageId: props.pageId,
	pageTitle: props.pageTitle || undefined,
	pageUrl: currentPageUrl.value,
	theme: props.theme,
}));

const isReady = computed(() => {
	return Boolean(config.public.cusdisAppId && props.pageId);
});
</script>

<template>
	<VueCusdis
		v-if="isReady"
		:key="`${attrs.appId}:${attrs.pageId}:${attrs.pageUrl}`"
		:attrs="attrs"
		:lang="lang"
	/>
</template>
