<script setup lang="ts">
import type { RoomListItem } from '~/features/study-group';

defineProps<{
	rooms: RoomListItem[];
}>();

const emit = defineEmits<{
	join: [roomId: string];
}>();
</script>

<template>
	<div class="grid gap-4 sm:grid-cols-2">
		<UCard v-for="room in rooms" :key="room.roomId">
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold">{{ room.name }}</h3>
					<span class="text-sm text-gray-500">
						{{ room.playerCount }}/{{ room.maxPlayers }}
					</span>
				</div>
				<p class="text-sm text-gray-500">
					Host: {{ room.hostUsername }} · {{ room.cardCount }} cards
				</p>
				<UButton
					label="Join"
					size="sm"
					block
					@click="emit('join', room.roomId)"
				/>
			</div>
		</UCard>
	</div>
</template>
