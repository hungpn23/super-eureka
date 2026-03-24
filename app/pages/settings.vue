<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  UPLOAD_AVATAR_SCHEMA,
  type UploadAvatarSchema,
} from "~/valibot/schemas";

const toast = useToast();
const { token, data: user, getSession } = useAuth();

// ─── State ────────────────────────────────────────────────────────────────────
const isUploading = ref(false);
const state = reactive<Partial<UploadAvatarSchema>>({});

function createObjectUrl(file: File) {
  return URL.createObjectURL(file);
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function onSubmit() {
  if (!state.avatar) return;

  const formData = new FormData();
  formData.append("avatar", state.avatar);

  isUploading.value = true;
  try {
    await $fetch("/api/users/avatar", {
      method: "POST",
      headers: { Authorization: token.value || "" },
      body: formData,
    });

    await getSession();
    toast.add({ title: "Avatar updated", color: "success" });
  } catch {
    toast.add({
      title: "Upload failed",
      description: "Please try again.",
      color: "error",
    });
  } finally {
    isUploading.value = false;
  }
}

// ─── State: Password ──────────────────────────────────────────────────────────
const passwordForm = reactive({
  current: "",
  next: "",
  confirm: "",
});
const showPasswords = reactive({ current: false, next: false, confirm: false });

const passwordStrength = computed(() => {
  const p = passwordForm.next;
  if (!p) return null;
  if (p.length < 6)
    return { label: "Weak", color: "error" as const, value: 25 };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { label: "Fair", color: "warning" as const, value: 60 };
  return { label: "Strong", color: "success" as const, value: 100 };
});

const passwordMismatch = computed(
  () => passwordForm.confirm && passwordForm.next !== passwordForm.confirm,
);

// ─── Handlers ─────────────────────────────────────────────────────────────────
function saveProfile() {
  toast.add({
    title: "Profile saved",
    description: "Your profile has been updated.",
    color: "success",
  });
}

function changePassword() {
  if (passwordMismatch.value) return;
  if (!passwordForm.current || !passwordForm.next) return;
  toast.add({
    title: "Password changed",
    description: "Use your new password next time you sign in.",
    color: "success",
  });
  passwordForm.current = "";
  passwordForm.next = "";
  passwordForm.confirm = "";
}
</script>

<template>
  <UContainer v-if="user" class="max-w-3xl space-y-4 mt-4">
    <h1 class="text-lg font-semibold">Settings</h1>

    <!-- ── Section: Profile picture ──────────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-camera" />
          <h2 class="font-medium">Profile picture</h2>
        </div>
      </template>

      <div
        class="flex flex-col sm:flex-row place-items-center sm:place-items-start gap-4"
      >
        <UAvatar
          class="mt-4"
          :src="
            state.avatar
              ? createObjectUrl(state.avatar)
              : user.avatar?.url || undefined
          "
          :alt="user.username"
          :text="user.username.charAt(0)"
          size="3xl"
        />

        <UForm
          class="flex-1 space-y-4"
          :schema="UPLOAD_AVATAR_SCHEMA"
          :state="state"
          @submit="onSubmit"
        >
          <UFormField name="avatar" :ui="{ error: 'text-center sm:text-left' }">
            <UFileUpload
              v-slot="{ open, removeFile }"
              v-model="state.avatar"
              accept="image/*"
            >
              <div class="flex-1 space-y-2 text-center sm:text-left">
                <p class="text-sm text-muted">
                  JPG, PNG or GIF. Max <span class="font-medium">2MB</span>.
                  This image will be shown on your profile and comments.
                </p>

                <div
                  class="flex flex-wrap gap-2 place-content-center sm:place-content-start"
                >
                  <UButton
                    icon="i-lucide-image"
                    color="primary"
                    variant="soft"
                    @click="open()"
                  >
                    Choose an image
                  </UButton>

                  <UButton
                    v-if="state.avatar"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="removeFile()"
                  >
                    Remove
                  </UButton>
                </div>

                <p v-if="state.avatar" class="text-xs text-muted">
                  {{ state.avatar.name }}
                </p>
              </div>
            </UFileUpload>
          </UFormField>

          <div class="flex place-content-end">
            <UButton
              type="submit"
              icon="i-lucide-upload"
              color="primary"
              label="Upload"
              :loading="isUploading"
              :disabled="!state.avatar"
            />
          </div>
        </UForm>
      </div>
    </UCard>

    <!-- ── Section: Profile Info ──────────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-user" />
          <h2 class="font-medium">Personal information</h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Display name" name="displayName">
          <UInput
            v-model="user.username"
            placeholder="Your name"
            icon="i-lucide-user"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Email" name="email">
          <UTooltip
            text="Email cannot be changed"
            :delay-duration="0"
            :content="{ align: 'start' }"
          >
            <UInput
              v-model="user.email"
              type="email"
              placeholder="email@example.com"
              icon="i-lucide-mail"
              class="w-full"
              disabled
            />
          </UTooltip>
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton icon="i-lucide-check" color="primary" @click="saveProfile">
            Save changes
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- ── Section: Change Password ──────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-lock" />
          <h2 class="font-medium">Change password</h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Current password" name="currentPassword">
          <UInput
            v-model="passwordForm.current"
            :type="showPasswords.current ? 'text' : 'password'"
            placeholder="Enter your current password"
            icon="i-lucide-lock"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="
                  showPasswords.current ? 'i-lucide-eye-off' : 'i-lucide-eye'
                "
                variant="ghost"
                color="neutral"
                size="xs"
                @click="showPasswords.current = !showPasswords.current"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="New password" name="newPassword">
          <UInput
            v-model="passwordForm.next"
            :type="showPasswords.next ? 'text' : 'password'"
            placeholder="At least 8 characters"
            icon="i-lucide-key"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPasswords.next ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="showPasswords.next = !showPasswords.next"
              />
            </template>
          </UInput>

          <!-- Strength indicator -->
          <div v-if="passwordStrength" class="mt-2 flex items-center gap-2">
            <UProgress
              :value="passwordStrength.value"
              :color="passwordStrength.color"
              size="xs"
              class="flex-1"
            />
            <UBadge :color="passwordStrength.color" variant="soft" size="xs">
              {{ passwordStrength.label }}
            </UBadge>
          </div>
        </UFormField>

        <UFormField
          label="Confirm new password"
          name="confirmPassword"
          :error="passwordMismatch ? 'Passwords do not match' : undefined"
        >
          <UInput
            v-model="passwordForm.confirm"
            :type="showPasswords.confirm ? 'text' : 'password'"
            placeholder="Re-enter your new password"
            icon="i-lucide-shield-check"
            :color="passwordMismatch ? 'error' : undefined"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="
                  showPasswords.confirm ? 'i-lucide-eye-off' : 'i-lucide-eye'
                "
                variant="ghost"
                color="neutral"
                size="xs"
                @click="showPasswords.confirm = !showPasswords.confirm"
              />
            </template>
          </UInput>
        </UFormField>

        <UAlert
          icon="i-lucide-info"
          color="info"
          variant="soft"
          title="Tips for a strong password"
          description="Use at least 8 characters with a mix of uppercase, lowercase, numbers and special characters."
        />
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            icon="i-lucide-lock"
            color="primary"
            :disabled="
              !passwordForm.current || !passwordForm.next || !!passwordMismatch
            "
            @click="changePassword"
          >
            Update password
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- ── Section: Danger Zone ───────────────────────────────────────────── -->
    <UCard class="shadow-sm ring-2 ring-error">
      <template #header>
        <div class="flex place-items-center gap-2 text-error">
          <UIcon class="size-5" name="i-lucide-triangle-alert" />
          <h2 class="font-medium">Danger zone</h2>
        </div>
      </template>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p class="font-medium text-gray-900 dark:text-white text-sm">
            Delete account
          </p>
          <p class="text-sm text-gray-500 mt-0.5">
            All your data, decks and learning progress will be permanently
            deleted.
          </p>
        </div>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          class="shrink-0"
          @click="
            toast.add({
              title: 'Not available',
              description: 'Please contact support.',
              color: 'error',
            })
          "
        >
          Delete account
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
