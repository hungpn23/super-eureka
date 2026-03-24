import type { UploadAvatarSchema } from "~/valibot/schemas";
import { useUserSettingToasts } from "./useUserSettingToasts";

export function useAvatarUpload() {
  const toast = useUserSettingToasts();
  const { token, getSession } = useAuth();

  // ─── Section: Avatar ──────────────────────────────────────────────────────────
  const isUploadingAvatar = ref(false);
  const uploadAvatarState = reactive<Partial<UploadAvatarSchema>>({});

  function createObjectUrl(file: File) {
    return URL.createObjectURL(file);
  }

  async function handleUploadAvatar() {
    if (!uploadAvatarState.avatar) return;
    const formData = new FormData();
    formData.append("avatar", uploadAvatarState.avatar);
    isUploadingAvatar.value = true;
    try {
      await $fetch("/api/users/avatar", {
        method: "POST",
        headers: { Authorization: token.value || "" },
        body: formData,
      });
      await getSession();
      toast.uploadAvatarSuccess();
    } catch {
      toast.uploadAvatarFailed();
    } finally {
      isUploadingAvatar.value = false;
    }
  }

  return {
    isUploadingAvatar,
    uploadAvatarState,
    createObjectUrl,
    handleUploadAvatar,
  };
}
