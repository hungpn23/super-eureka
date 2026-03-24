import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import type { UpdateProfileSchema } from "~/valibot/schemas";
import { useUserSettingToasts } from "./useUserSettingToasts";

export function useProfileUpdate() {
  const toast = useUserSettingToasts();
  const { token, data: user, getSession } = useAuth();

  const isUpdatingProfile = ref(false);

  const profileFields = computed<AuthFormField[]>(() => {
    return [
      {
        name: "username",
        type: "text",
        label: "Display name",
        placeholder: "Enter your username",
        defaultValue: user.value?.username,
        required: true,
      },
    ];
  });

  async function handleUpdateProfile(
    payload: FormSubmitEvent<UpdateProfileSchema>,
  ) {
    isUpdatingProfile.value = true;
    try {
      await $fetch("/api/users/profile", {
        method: "PATCH",
        headers: { Authorization: token.value || "" },
        body: payload.data,
      });
      await getSession();
      toast.updateProfileSuccess();
    } catch {
      toast.updateProfileFailed();
    } finally {
      isUpdatingProfile.value = false;
    }
  }

  return {
    isUpdatingProfile,
    profileFields,
    handleUpdateProfile,
  };
}
