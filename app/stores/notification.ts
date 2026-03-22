export const useNotificationStore = defineStore("notification", () => {
  const { $socket } = useNuxtApp();
  const ioStore = useSocketIOStore();
  const notifications = ref<Notification[]>([]);

  function handleNotificationAdded(data: Notification) {
    notifications.value.unshift(data);
    if (notifications.value.length > 20) notifications.value.pop();
  }

  watch(
    () => ioStore.isConnected,
    (connected) => {
      if (!connected) notifications.value = [];
    },
  );

  function setup() {
    $socket.on("notificationAdded", handleNotificationAdded);
  }

  function teardown() {
    $socket.off("notificationAdded", handleNotificationAdded);
  }

  return {
    notifications,
    setup,
    teardown,
  };
});
