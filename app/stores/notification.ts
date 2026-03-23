import type {
	GetNotificationsResponse,
	Notification,
} from "~/features/notification";
import type { ErrorResponse } from "~/shared/types";

export const useNotificationStore = defineStore("notification", () => {
	const { token, data: user } = useAuth();
	const { $socket } = useNuxtApp();
	const { isSocketConnected } = storeToRefs(useSocketIOStore());

	const notifications = ref<Notification[]>([]);
	const unreadCount = ref(0);

	const {
		data: res,
		error,
		execute,
	} = useFetch<GetNotificationsResponse, ErrorResponse>(
		"/api/notifications?limit=20",
		{
			method: "GET",
			headers: { Authorization: token.value || "" },
			immediate: false,
			watch: false,
		},
	);

	async function getRecentNotifications() {
		if (!token.value) return;

		await execute();

		if (res.value) {
			notifications.value = res.value.data;
			unreadCount.value = res.value.data.filter((n) => !n.readAt).length;
		}

		if (error.value) {
			notifications.value = [];
			unreadCount.value = 0;
		}
	}

	function setup() {
		$socket.on("notificationAdded", handleNotificationAdded);

		watch(isSocketConnected, (connected) => {
			if (!connected) notifications.value = [];
		});

		watch([token, user], async ([newToken, newUser], [oldToken, oldUser]) => {
			if (newToken === oldToken || newUser?.id === oldUser?.id) return;
			await getRecentNotifications();
		});

		if (token.value) getRecentNotifications();
	}

	function teardown() {
		$socket.off("notificationAdded", handleNotificationAdded);
	}

	function handleNotificationAdded(data: Notification) {
		notifications.value.unshift(data);
		unreadCount.value++;
		if (notifications.value.length > 20) notifications.value.pop();
	}

	return {
		notifications,
		unreadCount,
		getRecentNotifications,
		setup,
		teardown,
	};
});
