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
const wrapperRef = useTemplateRef<HTMLDivElement>("wrapper");

const CUSDIS_MIN_HEIGHT = 720;

let observer: MutationObserver | null = null;

const resizeCusdisFrame = () => {
	if (!import.meta.client) return;

	const wrapperEl = wrapperRef.value;
	const iframeEl = wrapperEl?.querySelector("iframe");

	if (!wrapperEl || !(iframeEl instanceof HTMLIFrameElement)) return;

	const targetHeight = Math.max(
		Math.round(window.innerHeight * 0.9),
		CUSDIS_MIN_HEIGHT,
	);

	iframeEl.style.display = "block";
	iframeEl.style.width = "100%";
	iframeEl.style.minHeight = `${targetHeight}px`;
	iframeEl.style.height = `${Math.max(iframeEl.offsetHeight, targetHeight)}px`;
	iframeEl.style.maxHeight = "none";
};

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

onMounted(() => {
	if (!import.meta.client) return;

	const wrapperEl = wrapperRef.value;

	if (!wrapperEl) return;

	resizeCusdisFrame();

	observer = new MutationObserver(() => {
		requestAnimationFrame(resizeCusdisFrame);
	});

	observer.observe(wrapperEl, {
		attributes: true,
		childList: true,
		subtree: true,
	});

	window.addEventListener("resize", resizeCusdisFrame);
});

onBeforeUnmount(() => {
	observer?.disconnect();
	observer = null;

	if (import.meta.client) {
		window.removeEventListener("resize", resizeCusdisFrame);
	}
});
</script>

<template>
	<div ref="wrapper" class="w-full">
		<VueCusdis
			v-if="isReady"
			:key="`${attrs.appId}:${attrs.pageId}:${attrs.pageUrl}`"
			:attrs="attrs"
			:lang="lang"
		/>
	</div>
</template>
