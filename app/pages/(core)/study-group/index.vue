<script setup lang="ts">
import { useStudyGroup } from '~/features/study-group';

const router = useRouter();
const {
	isConnected,
	roomList,
	roomInfo,
	connect,
	setup,
	teardown,
	fetchRoomList,
	createRoom,
	joinRoom,
	joinByPasscode,
} = useStudyGroup();

const isCreateModalOpen = ref(false);
const passcodeInput = ref("");

onMounted(() => {
	setup();
	connect();
});

watch(isConnected, (val) => {
	if (val) fetchRoomList();
});

watch(roomInfo, (val) => {
	if (val) {
		navigateTo(`/study-group/${val.roomId}`);
	}
});

onBeforeUnmount(() => {
	teardown();
});

function handleJoinByPasscode() {
	if (passcodeInput.value.trim()) {
		joinByPasscode(passcodeInput.value.trim());
	}
}

function handleJoinRoom(roomId: string) {
	joinRoom(roomId);
}

function handleCreateRoom(payload: {
	name: string;
	deckIds: string[];
	settings: any;
}) {
	createRoom(payload.name, payload.deckIds, payload.settings);
	isCreateModalOpen.value = false;
}
</script>

<template>
	<div class="mx-auto max-w-4xl space-y-6 p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">Study Group</h1>
			<UButton
				label="Create Room"
				icon="i-lucide-plus"
				@click="isCreateModalOpen = true"
			/>
		</div>

		<!-- Passcode Join -->
		<UCard>
			<div class="flex items-center gap-3">
				<UInput
					v-model="passcodeInput"
					placeholder="Enter room passcode"
					class="flex-1"
					@keyup.enter="handleJoinByPasscode"
				/>
				<UButton
					label="Join"
					color="neutral"
					variant="outline"
					@click="handleJoinByPasscode"
				/>
			</div>
		</UCard>

		<!-- Room List -->
		<div v-if="roomList.length" class="grid gap-4 sm:grid-cols-2">
			<UCard v-for="room in roomList" :key="room.roomId">
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
						@click="handleJoinRoom(room.roomId)"
					/>
				</div>
			</UCard>
		</div>

		<div v-else class="py-12 text-center text-gray-500">
			<p>No rooms available. Create one to get started!</p>
		</div>

		<!-- Create Room Modal -->
		<CreateRoomModal
			v-model:open="isCreateModalOpen"
			@create="handleCreateRoom"
		/>
	</div>
</template>
