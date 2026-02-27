import { type Socket } from "socket.io-client";

declare module "#app" {
	interface NuxtApp {
		$socket: Socket;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$socket: Socket;
	}
}

export default defineNuxtPlugin(() => {
	// const config = useRuntimeConfig();
	// const { token } = useAuth();
	// if (token.value) {
	// 	const socket = io(`${config.public.apiUrl}/notifications`, {
	// 		extraHeaders: { Authorization: token.value || "" },
	// 		withCredentials: true,
	// 	});
	// 	socket.on("connect", () => {
	// 		socket.on("socketConnected", (_message: string) => {
	// 			console.log("Connected to Socket.IO server.");
	// 		});
	// 	});
	// 	socket.on("disconnect", () => {
	// 		console.log("Disconnected from Socket.IO server.");
	// 	});
	// 	socket.on("connect_error", (_error: Error) => {
	// 		console.error("Socket.IO connection error.");
	// 	});
	// 	return { provide: { socket } };
	// }
});
