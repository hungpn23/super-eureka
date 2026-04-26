<script setup lang="ts">
import type { Ranking } from "../types/study-group.type";

defineProps<{
	rankings: Ranking[];
	isHost: boolean;
}>();

const podiumColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
const podiumLabels = ["1st", "2nd", "3rd"];

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}
</script>

<template>
	<div class="space-y-8">
		<h2 class="text-center text-2xl font-bold">Results</h2>

		<!-- Podium -->
		<div class="flex items-end justify-center gap-4">
			<div
				v-for="(player, idx) in rankings.slice(0, 3)"
				:key="player.userId"
				class="flex flex-col items-center"
			>
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold"
					:class="podiumColors[idx]"
				>
					{{ player.username.charAt(0).toUpperCase() }}
				</div>
				<p class="mt-2 font-semibold">{{ player.username }}</p>
				<p class="text-sm text-gray-500">{{ podiumLabels[idx] }}</p>
				<p class="text-sm">{{ formatTime(player.timeSeconds) }}</p>
			</div>
		</div>

		<!-- Full Results Table -->
		<UCard>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left text-gray-500">
						<th class="pb-2">#</th>
						<th class="pb-2">Player</th>
						<th class="pb-2 text-right">Completed</th>
						<th class="pb-2 text-right">Accuracy</th>
						<th class="pb-2 text-right">Time</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="player in rankings"
						:key="player.userId"
						class="border-b last:border-0"
					>
						<td class="py-2 font-semibold">{{ player.rank }}</td>
						<td class="py-2">{{ player.username }}</td>
						<td class="py-2 text-right">
							{{ player.completed }}/{{ player.correct + player.incorrect }}
						</td>
						<td class="py-2 text-right">{{ player.accuracy }}%</td>
						<td class="py-2 text-right">
							{{ formatTime(player.timeSeconds) }}
						</td>
					</tr>
				</tbody>
			</table>
		</UCard>

		<!-- Actions -->
		<div class="flex justify-center gap-3">
			<UButton
				v-if="isHost"
				label="Play Again"
				@click="navigateTo('/study-group')"
			/>
			<UButton
				label="Back to Library"
				color="neutral"
				variant="outline"
				@click="navigateTo('/library')"
			/>
		</div>
	</div>
</template>
