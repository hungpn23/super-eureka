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
  function handleConnect() {
    isConnected.value = true;
    connectionError.value = null;
    console.log("Connected to Socket.IO server.");
  }

  function handleDisconnect(reason: string) {
    isConnected.value = false;
    notifications.value = [];
    console.log("Disconnected:", reason);
  }

  function handleConnectError(err: Error) {
    connectionError.value = err.message;
    console.error("Socket.IO connection error:", err.message);
  }

  function handleSocketConnected(message: string) {
    console.log("socketConnected event:", message);
  }

  function handleNotificationAdded(data: Notification) {
    notifications.value.unshift(data);
  }

  // --- Setup / Teardown ---
  function setup() {
    $socket.on("connect", handleConnect);
    $socket.on("disconnect", handleDisconnect);
    $socket.on("connect_error", handleConnectError);
    $socket.on("socketConnected", handleSocketConnected);
    $socket.on("notificationAdded", handleNotificationAdded);

    watch([token, user], ([newToken, newUser], [oldToken, oldUser]) => {
      if (newToken === oldToken || newUser?.id === oldUser?.id) return;
      $socket.disconnect();
      if (newToken) connect();
    });

    if (token.value && !$socket.connected) connect();
  }

  function teardown() {
    $socket.off("connect", handleConnect);
    $socket.off("disconnect", handleDisconnect);
    $socket.off("connect_error", handleConnectError);
    $socket.off("socketConnected", handleSocketConnected);
    $socket.off("notificationAdded", handleNotificationAdded);
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
