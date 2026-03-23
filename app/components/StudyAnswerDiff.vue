<script setup lang="ts">
import type { Change } from "diff";

const props = defineProps<{
	diffs: Change[];
}>();

const diffs = computed(() => props.diffs ?? []);

function getDiffClass(diff: Change) {
	if (diff.added) return "text-success bg-success/25";
	if (diff.removed) return "text-error bg-error/25";
	return "";
}
</script>

<template>
	<div
		v-if="diffs.length"
		class="rounded-md border-2 border-dashed border-success bg-success/5 px-3 py-2 text-lg sm:text-xl"
	>
		<span v-for="(diff, i) in diffs" :key="i" :class="getDiffClass(diff)">
			{{ diff.value }}
		</span>
	</div>
</template>
