<script setup lang="ts">
import type { RoomInfo, PlayerInfo } from '~/features/study-group';

const props = defineProps<{
	roomInfo: RoomInfo | null;
	players: PlayerInfo[];
	isHost: boolean;
	canStart: boolean;
}>();

const emit = defineEmits<{
	start: [];
	leave: [];
}>();

const copied = ref(false);

async function copyPasscode() {
	if (!props.roomInfo) return;
	await navigator.clipboard.writeText(props.roomInfo.passcode);
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}

const playerColors = [
	"bg-blue-500",
	"bg-green-500",
	"bg-purple-500",
	"bg-orange-500",
	"bg-red-500",
	"bg-teal-500",
	"bg-pink-500",
	"bg-yellow-500",
];
</script>

<template>
	<div v-if="roomInfo" class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold">{{ roomInfo.name }}</h2>
			<UButton
				label="Leave"
				color="error"
				variant="outline"
				size="sm"
				@click="emit('leave')"
			/>
		</div>

		<!-- Passcode -->
		<UCard v-if="isHost">
			<div class="flex items-center gap-3">
				<span class="text-sm text-gray-500">Passcode:</span>
				<span class="font-mono text-lg font-bold tracking-widest">
					{{ roomInfo.passcode }}
				</span>
				<UButton
					:label="copied ? 'Copied!' : 'Copy'"
					size="xs"
					color="neutral"
					variant="outline"
					@click="copyPasscode"
				/>
			</div>
		</UCard>

		<!-- Settings Summary -->
		<UCard>
			<div class="grid grid-cols-3 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Cards</span>
					<p class="font-semibold">{{ roomInfo.cardCount }}</p>
				</div>
				<div>
					<span class="text-gray-500">Question Type</span>
					<p class="font-semibold capitalize">
						{{ roomInfo.settings.questionTypes.replace("_", " ") }}
					</p>
				</div>
				<div>
					<span class="text-gray-500">End Condition</span>
					<p class="font-semibold capitalize">
						{{ roomInfo.settings.endCondition.replace("_", " ") }}
					</p>
				</div>
			</div>
		</UCard>

		<!-- Players -->
		<div>
			<h3 class="mb-3 font-semibold">
				Players ({{ players.length }}/{{ roomInfo.settings.maxPlayers }})
			</h3>
			<div class="space-y-2">
				<div
					v-for="(player, idx) in players"
					:key="player.userId"
					class="flex items-center gap-3 rounded-lg border p-3"
				>
					<div
						:class="playerColors[idx % playerColors.length]"
						class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
					>
						{{ player.username.charAt(0).toUpperCase() }}
					</div>
					<span class="font-medium">{{ player.username }}</span>
					<span
						v-if="player.userId === roomInfo.hostId"
						class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800"
					>
						Host
					</span>
					<span v-if="!player.connected" class="text-xs text-red-500">
						Disconnected
					</span>
				</div>
			</div>
		</div>

		<!-- Start Button -->
		<UButton
			v-if="isHost"
			label="Start"
			size="lg"
			block
			:disabled="!canStart"
			@click="emit('start')"
		/>
		<p v-else class="text-center text-gray-500">Waiting for host to start...</p>
	</div>
</template>
