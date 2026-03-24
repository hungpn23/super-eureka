<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import { breakpointsTailwind } from "@vueuse/core";
import { ShortcutKey } from "~/shared/enums";

const colorMode = useColorMode();
const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const { status, data: user } = useAuthState();
const { signOut } = useAuth();

const isDarkMode = computed(() => colorMode.value === "dark");

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Library",
    to: "/library",
  },
  {
    label: "Shared",
    to: "/shared",
  },
  {
    label: "About me",
    to: "/profile2",
  },
]);

const avatarItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      to: "/profile",
    },
    {
      label: isDarkMode.value ? "Light Mode" : "Dark Mode",
      icon: isDarkMode.value ? "i-lucide-sun" : "i-lucide-moon",
      class: "cursor-pointer sm:hidden",
      onSelect: toggleColorMode,
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      onSelect: onSignOut,
    },
  ],
]);

function toggleColorMode() {
  colorMode.preference = isDarkMode.value ? "light" : "dark";
}

async function onSignOut() {
  await signOut({ callbackUrl: "/login" });
}

defineShortcuts({
  [ShortcutKey.TOGGLE_COLOR_MODE]: toggleColorMode,
});
</script>

<template>
  <UHeader toggle-side="left">
    <template #left>
      <NuxtLink to="/">
        <h1 class="text-2xl font-bold">Vocabify</h1>
      </NuxtLink>
    </template>

    <template #default>
      <UNavigationMenu :items="items" variant="link" />
    </template>

    <template #right>
      <div v-if="status === 'unauthenticated'">
        <UButton
          label="Sign in"
          color="neutral"
          variant="outline"
          to="/login"
          class="mr-2 hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/sign-up"
        />
      </div>

      <div v-else class="flex place-content-between place-items-center gap-1.5">
        <ClientOnly>
          <UButton
            class="cursor-pointer"
            icon="i-lucide-search"
            variant="ghost"
            color="neutral"
          />

          <KeyboardShortcuts v-if="smAndLarger" class="cursor-pointer" />

          <UColorModeButton v-if="smAndLarger" class="cursor-pointer" />

          <AppNotification />

          <UDropdownMenu :items="avatarItems" :content="{ align: 'start' }">
            <UButton
              v-if="user"
              :avatar="{ src: user.avatarUrl || '', class: 'size-8' }"
              class="rounded-full cursor-pointer"
              variant="link"
              color="neutral"
            />
          </UDropdownMenu>
        </ClientOnly>
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />

      <div v-if="status === 'unauthenticated'">
        <USeparator class="my-6" />

        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton label="Sign up" color="neutral" to="/sign-up" block />
      </div>
    </template>
  </UHeader>
</template>
