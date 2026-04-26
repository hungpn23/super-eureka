import { io, type Socket } from "socket.io-client";

declare module "#app" {
	interface NuxtApp {
		$socket: Socket;
		$studyGroupSocket: Socket;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$socket: Socket;
		$studyGroupSocket: Socket;
	}
}

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const { token } = useAuth();

	const socket = io(`${config.public.apiUrl}/notifications`, {
		autoConnect: false,
		withCredentials: true,
		extraHeaders: { Authorization: token.value || "" },
	});

	const studyGroupSocket = io(`${config.public.apiUrl}/study-group`, {
		autoConnect: false,
		withCredentials: true,
		extraHeaders: { Authorization: token.value || "" },
	});

	return { provide: { socket, studyGroupSocket } };
});
