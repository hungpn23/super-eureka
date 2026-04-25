import { DEFAULT_TOAST_OPTIONS } from "~/shared/constants";

export function useUserSettingToasts() {
	const toast = useToast();

	return {
		uploadAvatarSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Avatar updated successfully.",
				description: undefined,
			});
		},
		uploadAvatarFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to upload avatar.",
			});
		},
		changePasswordSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Password changed successfully.",
				description: undefined,
			});
		},
		changePasswordFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to change password.",
			});
		},
		updateProfileSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Profile updated successfully.",
				description: undefined,
			});
		},
		updateProfileFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to update profile.",
			});
		},
		deleteAccountSuccess: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.SUCCESS,
				title: "Account deleted successfully.",
				description: undefined,
			});
		},
		deleteAccountFailed: () => {
			toast.add({
				...DEFAULT_TOAST_OPTIONS.FAIL,
				title: "Failed to delete account.",
			});
		},
	};
}
