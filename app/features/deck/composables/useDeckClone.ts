import type { CloneDeckSchema } from "../types";

export function useDeckClone() {
	const isModalOpen = refManualReset(false);

	const state = reactive<CloneDeckSchema>({
		passcode: "",
	});

	return {
		isModalOpen,
		state,
	};
}
