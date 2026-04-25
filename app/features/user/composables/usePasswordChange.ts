import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import type { ChangePasswordSchema } from "~/valibot/schemas";
import { useUserSettingToasts } from "./useUserSettingToasts";

export function usePasswordChange() {
	const toast = useUserSettingToasts();
	const { token } = useAuth();

	const isChangingPassword = ref(false);

	const passwordFields: AuthFormField[] = [
		{
			name: "oldPassword",
			type: "password",
			label: "Current password",
			placeholder: "Enter your current password",
			required: true,
		},
		{
			name: "newPassword",
			type: "password",
			label: "New password",
			placeholder: "Enter your new password",
			required: true,
		},
		{
			name: "confirmPassword",
			type: "password",
			label: "Confirm new password",
			placeholder: "Re-enter your new password",
			required: true,
		},
	];

	async function handleChangePassword(
		payload: FormSubmitEvent<ChangePasswordSchema>,
	) {
		isChangingPassword.value = true;
		try {
			await $fetch("/api/auth/password/change", {
				method: "POST",
				headers: { Authorization: token.value || "" },
				body: {
					oldPassword: payload.data.oldPassword,
					newPassword: payload.data.newPassword,
				},
			});

			toast.changePasswordSuccess();
		} catch {
			toast.changePasswordFailed();
		} finally {
			isChangingPassword.value = false;
		}
	}

	return {
		isChangingPassword,
		passwordFields,
		handleChangePassword,
	};
}
