import { io, type Socket } from "socket.io-client";

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
	const config = useRuntimeConfig();
	const { token } = useAuth();

	const socket = io(`${config.public.apiUrl}/notifications`, {
		autoConnect: false,
		withCredentials: true,
		extraHeaders: { Authorization: token.value || "" },
	});

	return { provide: { socket } };
});
