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
  if (p.length < 6) return { label: "Yếu", color: "error" as const, value: 25 };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { label: "Trung bình", color: "warning" as const, value: 60 };
  return { label: "Mạnh", color: "success" as const, value: 100 };
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
      title: "Ảnh quá lớn",
      description: "Vui lòng chọn ảnh dưới 2MB",
      color: "error",
    });
    return;
  }
  avatarFile.value = file;
  avatarUrl.value = URL.createObjectURL(file);
  toast.add({ title: "Đã cập nhật avatar", color: "success" });
}

function removeAvatar() {
  avatarUrl.value = null;
  avatarFile.value = null;
  if (avatarInputRef.value) avatarInputRef.value.value = "";
}

function saveProfile() {
  toast.add({
    title: "Đã lưu thông tin",
    description: "Hồ sơ của bạn đã được cập nhật.",
    color: "success",
  });
}

function changePassword() {
  if (passwordMismatch.value) return;
  if (!passwordForm.current || !passwordForm.next) return;
  toast.add({
    title: "Đổi mật khẩu thành công",
    description: "Hãy dùng mật khẩu mới cho lần đăng nhập tiếp theo.",
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
            Ảnh JPG, PNG hoặc GIF. Tối đa <strong>2MB</strong>. Ảnh sẽ được hiển
            thị ở hồ sơ và bình luận của bạn.
          </p>
          <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
            <UButton
              icon="i-lucide-upload"
              color="primary"
              variant="soft"
              @click="triggerAvatarUpload"
            >
              Tải ảnh lên
            </UButton>
            <UButton
              v-if="avatarUrl"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="removeAvatar"
            >
              Xoá
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
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user" class="w-4 h-4 text-indigo-500" />
          <h2 class="font-semibold text-gray-900 dark:text-white">
            Thông tin cá nhân
          </h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Tên hiển thị" name="displayName">
          <UInput
            v-model="user.username"
            placeholder="Tên của bạn"
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

        <!-- <UFormField label="Giới thiệu bản thân" name="bio">
          <UTextarea
            v-model="user.emailVerified"
            placeholder="Viết vài dòng về bạn..."
            :rows="3"
            class="w-full"
          />
        </UFormField> -->
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton icon="i-lucide-check" color="primary" @click="saveProfile">
            Lưu thay đổi
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- ── Section: Change Password ──────────────────────────────────────── -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-lock" class="w-4 h-4 text-indigo-500" />
          <h2 class="font-semibold text-gray-900 dark:text-white">
            Đổi mật khẩu
          </h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Mật khẩu hiện tại" name="currentPassword">
          <UInput
            v-model="passwordForm.current"
            :type="showPasswords.current ? 'text' : 'password'"
            placeholder="Nhập mật khẩu hiện tại"
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

        <UFormField label="Mật khẩu mới" name="newPassword">
          <UInput
            v-model="passwordForm.next"
            :type="showPasswords.next ? 'text' : 'password'"
            placeholder="Ít nhất 8 ký tự"
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
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          :error="passwordMismatch ? 'Mật khẩu không khớp' : undefined"
        >
          <UInput
            v-model="passwordForm.confirm"
            :type="showPasswords.confirm ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu mới"
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
          title="Gợi ý tạo mật khẩu mạnh"
          description="Dùng ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt."
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
            Cập nhật mật khẩu
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- ── Section: Danger Zone ───────────────────────────────────────────── -->
    <UCard class="shadow-sm border border-red-200 dark:border-red-900">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-triangle-alert" class="w-4 h-4 text-red-500" />
          <h2 class="font-semibold text-red-600 dark:text-red-400">
            Vùng nguy hiểm
          </h2>
        </div>
      </template>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p class="font-medium text-gray-900 dark:text-white text-sm">
            Xoá tài khoản
          </p>
          <p class="text-sm text-gray-500 mt-0.5">
            Toàn bộ dữ liệu, bộ thẻ và tiến trình học sẽ bị xoá vĩnh viễn.
          </p>
        </div>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          class="shrink-0"
          @click="
            toast.add({
              title: 'Tính năng chưa khả dụng',
              description: 'Vui lòng liên hệ hỗ trợ.',
              color: 'error',
            })
          "
        >
          Xoá tài khoản
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
