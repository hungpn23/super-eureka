import type { Socket } from "socket.io-client";
import type {
	CardSnapshot,
	PlayerInfo,
	PlayerProgress,
	Ranking,
	RoomInfo,
	RoomListItem,
} from "../types/study-group.type";

export function useStudyGroup() {
	const { $studyGroupSocket: socket } = useNuxtApp();
	const { data: user, token } = useAuth();
	const toast = useToast();

	const isConnected = ref(false);
	const roomInfo = ref<RoomInfo | null>(null);
	const players = ref<PlayerInfo[]>([]);
	const progress = ref<PlayerProgress[]>([]);
	const rankings = ref<Ranking[]>([]);
	const cards = ref<CardSnapshot[]>([]);
	const roomList = ref<RoomListItem[]>([]);
	const roomStatus = ref<string>("waiting");
	const countdownSeconds = ref(0);
	const startedAt = ref<string | null>(null);
	const errorMessage = ref<string | null>(null);

	function connect() {
		if (socket.connected) return;

		// Update auth header before connecting
		(socket.io.opts.extraHeaders as any).Authorization = token.value || "";
		socket.connect();
	}

	function disconnect() {
		socket.disconnect();
	}

	function setup() {
		socket.on("connect", () => {
			isConnected.value = true;
		});

		socket.on("disconnect", () => {
			isConnected.value = false;
		});

		socket.on("roomCreated" as any, (payload: RoomInfo) => {
			roomInfo.value = payload;
			roomStatus.value = payload.status;
			players.value = [
				{
					userId: payload.hostId,
					username: user.value?.username ?? "You",
					avatar: user.value?.avatar ?? null,
					joinedAt: payload.createdAt,
					connected: true,
				},
			];
		});

		socket.on("playerJoined" as any, (payload: PlayerInfo) => {
			const exists = players.value.find((p) => p.userId === payload.userId);
			if (!exists) {
				players.value.push(payload);
			}
		});

		socket.on("playerLeft" as any, (payload: { userId: string }) => {
			players.value = players.value.filter((p) => p.userId !== payload.userId);
		});

		socket.on("countdownStarted" as any, (payload: { seconds: number }) => {
			roomStatus.value = "countdown";
			countdownSeconds.value = payload.seconds;

			const interval = setInterval(() => {
				countdownSeconds.value--;
				if (countdownSeconds.value <= 0) {
					clearInterval(interval);
				}
			}, 1000);
		});

		socket.on(
			"sessionStarted" as any,
			(payload: { cards: CardSnapshot[]; startedAt: string }) => {
				roomStatus.value = "playing";
				cards.value = payload.cards;
				startedAt.value = payload.startedAt;
			},
		);

		socket.on(
			"progressUpdate" as any,
			(payload: { players: PlayerProgress[] }) => {
				progress.value = payload.players;
			},
		);

		socket.on("sessionEnded" as any, (payload: { rankings: Ranking[] }) => {
			roomStatus.value = "finished";
			rankings.value = payload.rankings;
		});

		socket.on("roomLocked" as any, () => {
			// Room is locked, no more joins
		});

		socket.on("roomClosed" as any, (payload: { reason: string }) => {
			toast.add({
				title: "Room closed",
				description: payload.reason,
				color: "warning",
			});
			roomInfo.value = null;
			roomStatus.value = "waiting";
		});

		socket.on("roomList" as any, (payload: RoomListItem[]) => {
			roomList.value = payload;
		});

		socket.on("error" as any, (payload: { message: string }) => {
			errorMessage.value = payload.message;
			toast.add({
				title: "Error",
				description: payload.message,
				color: "error",
			});
		});
	}

	function teardown() {
		socket.off("connect");
		socket.off("disconnect");
		socket.off("roomCreated");
		socket.off("playerJoined");
		socket.off("playerLeft");
		socket.off("countdownStarted");
		socket.off("sessionStarted");
		socket.off("progressUpdate");
		socket.off("sessionEnded");
		socket.off("roomLocked");
		socket.off("roomClosed");
		socket.off("roomList");
		socket.off("error");
		disconnect();
	}

	function createRoom(name: string, deckIds: string[], settings: any) {
		socket.emit("createRoom" as any, {
			name,
			deckIds,
			settings,
			username: user.value?.username,
			avatar: user.value?.avatar ?? null,
		});
	}

	function joinRoom(roomId: string) {
		socket.emit("joinRoom" as any, {
			roomId,
			username: user.value?.username,
			avatar: user.value?.avatar ?? null,
		});
	}

	function joinByPasscode(passcode: string) {
		socket.emit("joinRoom" as any, {
			passcode,
			username: user.value?.username,
			avatar: user.value?.avatar ?? null,
		});
	}

	function startSession(roomId: string) {
		socket.emit("startSession" as any, { roomId });
	}

	function answerCard(
		roomId: string,
		cardId: string,
		answer: string | number,
		questionType: string,
	) {
		socket.emit("answerCard" as any, { roomId, cardId, answer, questionType });
	}

	function leaveRoom(roomId: string) {
		socket.emit("leaveRoom" as any, { roomId });
	}

	function fetchRoomList() {
		socket.emit("listRooms" as any);
	}

	const isHost = computed(() => {
		return roomInfo.value?.hostId === user.value?.id;
	});

	const canStart = computed(() => {
		return (
			isHost.value &&
			players.value.length >= 2 &&
			roomStatus.value === "waiting"
		);
	});

	return {
		// State
		isConnected,
		roomInfo,
		players,
		progress,
		rankings,
		cards,
		roomList,
		roomStatus,
		countdownSeconds,
		startedAt,
		errorMessage,
		isHost,
		canStart,

		// Methods
		connect,
		disconnect,
		setup,
		teardown,
		createRoom,
		joinRoom,
		joinByPasscode,
		startSession,
		answerCard,
		leaveRoom,
		fetchRoomList,
	};
}
