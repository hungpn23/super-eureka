<script setup lang="ts">
import { useStudyGroup } from "~/features/study-group/composables/useStudyGroup";

const route = useRoute();
const roomId = computed(() => route.params.roomId as string);

const {
	isConnected,
	roomInfo,
	players,
	progress,
	rankings,
	cards,
	roomStatus,
	countdownSeconds,
	startedAt,
	isHost,
	canStart,
	connect,
	setup,
	teardown,
	joinRoom,
	startSession,
	answerCard,
	leaveRoom,
} = useStudyGroup();

onMounted(() => {
	setup();
	connect();
});

watch(isConnected, (val) => {
	if (val && !roomInfo.value) {
		joinRoom(roomId.value);
	}
});

onBeforeUnmount(() => {
	if (roomInfo.value) {
		leaveRoom(roomId.value);
	}
	teardown();
});

function handleStart() {
	startSession(roomId.value);
}

function handleAnswer(
	cardId: string,
	answer: string | number,
	questionType: string,
) {
	answerCard(roomId.value, cardId, answer, questionType);
}

function handleLeave() {
	leaveRoom(roomId.value);
	navigateTo("/study-group");
}
</script>

<template>
	<div class="mx-auto max-w-5xl p-6">
		<!-- Waiting -->
		<WaitingRoom
			v-if="roomStatus === 'waiting'"
			:room-info="roomInfo"
			:players="players"
			:is-host="isHost"
			:can-start="canStart"
			@start="handleStart"
			@leave="handleLeave"
		/>

		<!-- Countdown -->
		<div
			v-else-if="roomStatus === 'countdown'"
			class="flex min-h-[60vh] items-center justify-center"
		>
			<div class="text-center">
				<p class="text-6xl font-bold animate-pulse">{{ countdownSeconds }}</p>
				<p class="mt-4 text-lg text-gray-500">Get ready!</p>
			</div>
		</div>

		<!-- Playing -->
		<div v-else-if="roomStatus === 'playing'" class="space-y-6">
			<RaceTrack :progress="progress" :started-at="startedAt" />
			<StudyCard
				:cards="cards"
				:question-types="roomInfo?.settings?.questionTypes ?? 'both'"
				@answer="handleAnswer"
			/>
		</div>

		<!-- Finished -->
		<Leaderboard
			v-else-if="roomStatus === 'finished'"
			:rankings="rankings"
			:is-host="isHost"
		/>
	</div>
</template>
