import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";

export function useStudyToasts() {
	const toast = useToast();

	return {
		getUserStatsFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to load your stats.",
				description: undefined,
			});
		},
	};
}
