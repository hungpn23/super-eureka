<script setup lang="ts">
import type { PlayerProgress } from "../types/study-group.type";

const props = defineProps<{
	progress: PlayerProgress[];
	startedAt: string | null;
}>();

const elapsed = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
	timer = setInterval(() => {
		if (props.startedAt) {
			elapsed.value = Math.floor(
				(Date.now() - new Date(props.startedAt).getTime()) / 1000,
			);
		}
	}, 1000);
});

onBeforeUnmount(() => {
	if (timer) clearInterval(timer);
});

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

const sortedProgress = computed(() => {
	return [...props.progress].sort((a, b) => b.percentage - a.percentage);
});

const colors = [
	"from-blue-500 to-blue-400",
	"from-green-500 to-green-400",
	"from-purple-500 to-purple-400",
	"from-orange-500 to-orange-400",
	"from-red-500 to-red-400",
	"from-teal-500 to-teal-400",
	"from-pink-500 to-pink-400",
	"from-yellow-500 to-yellow-400",
];
</script>

<template>
	<UCard>
		<div class="space-y-1">
			<div class="flex items-center justify-between text-sm text-gray-500">
				<span>{{ sortedProgress[0]?.total ?? 0 }} cards</span>
				<span>{{ formatTime(elapsed) }}</span>
			</div>

			<div class="space-y-3">
				<div
					v-for="(player, idx) in sortedProgress"
					:key="player.userId"
					class="space-y-1"
				>
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">{{ player.username }}</span>
						<span class="text-gray-500">
							{{ player.completed }}/{{ player.total }}({{ player.percentage }}
							%)
						</span>
					</div>
					<div
						class="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
					>
						<div
							class="h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out"
							:class="colors[idx % colors.length]"
							:style="{ width: `${player.percentage}%` }"
						/>
					</div>
				</div>
			</div>
		</div>
	</UCard>
</template>
