import type {
  GetNotificationsResponse,
  Notification,
} from "~/features/notification";

export const useNotificationStore = defineStore("notification", () => {
  const { token, data: user } = useAuth();
  const { $socket } = useNuxtApp();
  const { isSocketConnected } = storeToRefs(useSocketIOStore());

  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);

  async function getRecentNotifications() {
    if (!token.value) return;

    await $fetch<GetNotificationsResponse>("/api/notifications?limit=20", {
      method: "GET",
      headers: { Authorization: token.value || "" },
    })
      .then((res) => {
        notifications.value = res.data;
        unreadCount.value = res.data.filter((n) => !n.readAt).length;
      })
      .catch(() => {
        notifications.value = [];
        unreadCount.value = 0;
      });
  }

  function setup() {
    $socket.on("notificationAdded", handleNotificationAdded);

    watch(isSocketConnected, (connected) => {
      if (!connected) notifications.value = [];
    });

    watch([token, user], async ([newToken, newUser], [_, oldUser]) => {
      if (newUser && oldUser && newUser.id === oldUser.id) return; // refresh token case
      if (!newToken || !newUser?.id) return; // logout case

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
