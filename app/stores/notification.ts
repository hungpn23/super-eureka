import type { Socket } from "socket.io-client";

export const useNotificationStore = defineStore("notification", () => {
  const { $socket }: { $socket: Socket } = useNuxtApp();
  const { token, data: user } = useAuth();

  const notifications = ref<Notification[]>([]);
  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);

  // --- Socket actions ---
  function connect() {
    if ($socket.connected) return;
    $socket.io.opts.extraHeaders = { Authorization: token.value ?? "" };
    $socket.connect();
  }

  // --- Handlers ---
  function onConnect() {
    isConnected.value = true;
    connectionError.value = null;
    console.log("Connected to Socket.IO server.");
  }

  function onDisconnect(reason: string) {
    isConnected.value = false;
    notifications.value = [];
    console.log("Disconnected:", reason);
  }

  function onConnectError(err: Error) {
    connectionError.value = err.message;
    console.error("Socket.IO connection error:", err.message);
  }

  function onSocketConnected(message: string) {
    console.log("socketConnected event:", message);
  }

  function onNotificationAdded(data: Notification) {
    notifications.value.unshift(data);
  }

  // --- Setup / Teardown ---
  function setup() {
    $socket.on("connect", onConnect);
    $socket.on("disconnect", onDisconnect);
    $socket.on("connect_error", onConnectError);
    $socket.on("socketConnected", onSocketConnected);
    $socket.on("notificationAdded", onNotificationAdded);

    watch([token, user], ([newToken, newUser], [oldToken, oldUser]) => {
      if (newToken === oldToken || newUser?.id === oldUser?.id) return;
      $socket.disconnect();
      if (newToken) connect();
    });

    if (token.value && !$socket.connected) connect();
  }

  function teardown() {
    $socket.off("connect", onConnect);
    $socket.off("disconnect", onDisconnect);
    $socket.off("connect_error", onConnectError);
    $socket.off("socketConnected", onSocketConnected);
    $socket.off("notificationAdded", onNotificationAdded);
    $socket.disconnect();
  }

  return {
    notifications,
    isConnected,
    connectionError,
    connect,
    setup,
    teardown,
  };
});
