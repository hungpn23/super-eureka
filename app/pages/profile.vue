<script setup lang="ts">
import {
  useAvatarUpload,
  usePasswordChange,
  useProfileUpdate,
} from "~/features/user";
import {
  CHANGE_PASSWORD_SCHEMA,
  UPDATE_PROFILE_SCHEMA,
  UPLOAD_AVATAR_SCHEMA,
} from "~/valibot/schemas";

const { data: user } = useAuth();

const {
  isUploadingAvatar,
  uploadAvatarState,
  createObjectUrl,
  handleUploadAvatar,
} = useAvatarUpload();

const { isUpdatingProfile, profileFields, handleUpdateProfile } =
  useProfileUpdate();

const { isChangingPassword, passwordFields, handleChangePassword } =
  usePasswordChange();
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
            uploadAvatarState.avatar
              ? createObjectUrl(uploadAvatarState.avatar)
              : user.avatar?.url || undefined
          "
          :alt="user.username"
          :text="user.username.charAt(0)"
          size="3xl"
        />

        <UForm
          class="flex-1 space-y-4"
          :schema="UPLOAD_AVATAR_SCHEMA"
          :state="uploadAvatarState"
          @submit="handleUploadAvatar"
        >
          <UFormField name="avatar" :ui="{ error: 'text-center sm:text-left' }">
            <UFileUpload
              v-slot="{ open, removeFile }"
              v-model="uploadAvatarState.avatar"
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
                    v-if="uploadAvatarState.avatar"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="removeFile()"
                  >
                    Remove
                  </UButton>
                </div>
                <p v-if="uploadAvatarState.avatar" class="text-xs text-muted">
                  {{ uploadAvatarState.avatar.name }}
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
              :loading="isUploadingAvatar"
              :disabled="!uploadAvatarState.avatar"
            />
          </div>
        </UForm>
      </div>
    </UCard>

    <!-- ── Section: Personal information ─────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-user" />
          <h2 class="font-medium">Personal information</h2>
        </div>
      </template>

      <!-- email hiển thị read-only bên ngoài form vì không được update -->
      <div class="mb-4">
        <UFormField label="Email" name="email">
          <UTooltip
            text="Email cannot be changed"
            :delay-duration="0"
            :content="{ align: 'start' }"
          >
            <UInput
              :model-value="user.email"
              type="email"
              icon="i-lucide-mail"
              class="w-full"
              disabled
            />
          </UTooltip>
        </UFormField>
      </div>

      <UAuthForm
        :fields="profileFields"
        :schema="UPDATE_PROFILE_SCHEMA"
        :loading="isUpdatingProfile"
        :submit="{ label: 'Save changes', icon: 'i-lucide-check' }"
        @submit="handleUpdateProfile"
      />
    </UCard>

    <!-- ── Section: Change password ───────────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex place-items-center gap-2">
          <UIcon class="size-5" name="i-lucide-lock" />
          <h2 class="font-medium">Change password</h2>
        </div>
      </template>

      <UAuthForm
        :fields="passwordFields"
        :schema="CHANGE_PASSWORD_SCHEMA"
        :loading="isChangingPassword"
        :submit="{ label: 'Update password', icon: 'i-lucide-lock' }"
        @submit="handleChangePassword"
      >
        <template #validation>
          <UAlert
            icon="i-lucide-info"
            color="info"
            variant="soft"
            title="Tips for a strong password"
            description="Use at least 8 characters with a mix of uppercase, lowercase, numbers and special characters."
          />
        </template>
      </UAuthForm>
    </UCard>

    <!-- ── Section: Danger Zone ───────────────────────────────────────────────── -->
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
          @click="console.error('Not available yet')"
        >
          Delete account
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
