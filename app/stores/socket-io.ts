export const useSocketIOStore = defineStore("socket-io", () => {
	const { $socket } = useNuxtApp();
	const { token, data: user } = useAuth();

	const isSocketConnected = ref(false);
	const connectionError = ref<string | null>(null);

	function connect() {
		if ($socket.connected) return;
		$socket.io.opts.extraHeaders = { Authorization: token.value ?? "" };
		$socket.connect();
	}

	function setup() {
		$socket.on("connect", handleConnect);
		$socket.on("disconnect", handleDisconnect);
		$socket.on("connect_error", handleConnectError);

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

		$socket.disconnect();
	}

	function handleConnect() {
		isSocketConnected.value = true;
		connectionError.value = null;
		console.log("Connected to Socket.IO server.");
	}

	function handleDisconnect(reason: string) {
		isSocketConnected.value = false;
		console.log("Disconnected:", reason);
	}

	function handleConnectError(err: Error) {
		connectionError.value = err.message;
		console.error("Socket.IO connection error:", err.message);
	}

	return {
		isSocketConnected,
		connectionError,
		connect,
		setup,
		teardown,
	};
});
