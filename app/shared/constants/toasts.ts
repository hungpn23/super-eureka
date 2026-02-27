export const DEFAULT_TOAST_OPTIONS = {
	FAIL: {
		title: "Unknown error occurred.",
		description: "Please try again later.",
		color: "error",
		icon: "i-lucide-circle-x",
	},
	SUCCESS: {
		title: "Success",
		description: "Operation completed successfully.",
		color: "success",
		icon: "i-lucide-circle-check",
	},
} as const;
