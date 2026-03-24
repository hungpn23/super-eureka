<script setup lang="ts">
import { computed, reactive, ref } from "vue";

const { data: user } = useAuth();

// ─── State: Profile ───────────────────────────────────────────────────────────
const avatarUrl = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const avatarInputRef = ref<HTMLInputElement | null>(null);

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
const toast = useToast();

function triggerAvatarUpload() {
  avatarInputRef.value?.click();
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast.add({
      title: "Image too large",
      description: "Please choose an image under 2MB.",
      color: "error",
    });
    return;
  }
  avatarFile.value = file;
  avatarUrl.value = URL.createObjectURL(file);
  toast.add({ title: "Avatar updated", color: "success" });
}

function removeAvatar() {
  avatarUrl.value = null;
  avatarFile.value = null;
  if (avatarInputRef.value) avatarInputRef.value.value = "";
}

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

    <!-- ── Section: Profile Picture ──────────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-camera" />
          <h2 class="font-medium">Profile picture</h2>
        </div>
      </template>

      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <UAvatar
          :src="avatarUrl ?? undefined"
          :alt="user.username"
          :text="user.username.charAt(0)"
          size="3xl"
          class="ring-4 ring-gray-100 dark:ring-gray-800 shrink-0"
        />

        <div class="flex-1 space-y-3 text-center sm:text-left">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            JPG, PNG or GIF. Max <strong>2MB</strong>. This image will be shown
            on your profile and comments.
          </p>
          <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
            <UButton
              icon="i-lucide-upload"
              color="primary"
              variant="soft"
              @click="triggerAvatarUpload"
            >
              Upload image
            </UButton>
            <UButton
              v-if="avatarUrl"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="removeAvatar"
            >
              Remove
            </UButton>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onAvatarChange"
          />
        </div>
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
          <UInput
            v-model="user.email"
            type="email"
            placeholder="email@example.com"
            icon="i-lucide-mail"
            class="w-full"
          />
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
