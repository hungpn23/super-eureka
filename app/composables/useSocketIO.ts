export function useSocketIO() {
  const { $socket } = useNuxtApp();
  const { token, data: user } = useAuth();

  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);
  const notifications = ref<unknown[]>([]);

  function connect() {
    if ($socket.connected) return;

    // Cập nhật token mới nhất trước khi connect/reconnect
    $socket.io.opts.extraHeaders = { Authorization: token.value ?? "" };

    $socket.connect();
  }

  // --- Handlers (khai báo riêng để off() hoạt động đúng) ---
  function onConnect() {
    isConnected.value = true;
    connectionError.value = null;
    console.log("Connected to Socket.IO server.");
  }

  function onDisconnect(reason: string) {
    isConnected.value = false;
    console.log("Disconnected:", reason);
  }

  function onConnectError(err: Error) {
    connectionError.value = err.message;
    console.error("Socket.IO connection error:", err.message);
  }

  function onSocketConnected(message: string) {
    console.log("socketConnected event:", message);
  }

  function onNotificationAdded(data: unknown) {
    console.log("notificationAdded event:", data);
    notifications.value.unshift(data);
  }

  // ✅ Theo dõi token thay đổi
  watch([token, user], ([newToken, newUser], [oldToken, oldUser]) => {
    if (newToken === oldToken) return;
    if (newToken !== oldToken && newUser?.id === oldUser?.id) return;

    $socket.disconnect();
    if (newToken) connect();
  });

  onMounted(() => {
    $socket.on("connect", onConnect);
    $socket.on("disconnect", onDisconnect);
    $socket.on("connect_error", onConnectError);
    $socket.on("socketConnected", onSocketConnected);
    $socket.on("notificationAdded", onNotificationAdded);

    // Tự động connect khi component mount nếu có token
    if (token.value && !$socket.connected) connect();
  });

  onUnmounted(() => {
    $socket.off("connect", onConnect);
    $socket.off("disconnect", onDisconnect);
    $socket.off("connect_error", onConnectError);
    $socket.off("socketConnected", onSocketConnected);
    $socket.off("notificationAdded", onNotificationAdded);
  });

  return {
    instance: $socket,
    isConnected,
    connectionError,
    notifications,
    connect,
  };
}
