<script setup lang="ts">
import { UAvatar } from '#components';
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const { status, data } = useAuthState();
const { signOut } = useAuth();
const colorMode = useColorMode();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/home',
  },
]);

const avatarItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
    },
    {
      label: colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode',
      icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect: () => {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
      },
      class: 'cursor-pointer',
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      to: '/settings',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: async () => await signOut({ callbackUrl: '/' }),
    },
  ],
]);
</script>

<template>
  <UHeader toggle-side="left">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-6 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <div v-if="status === 'unauthenticated'">
        <UButton
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="lg:hidden"
        />

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
          to="/signup"
        />
      </div>

      <UDropdownMenu
        v-else
        type="hover"
        :items="avatarItems"
        :content="{
          align: 'start',
        }"
        arrow
      >
        <UAvatar
          class="squircle rounded-none"
          :src="data?.avatarUrl || ''"
          icon="i-lucide-image"
        />
      </UDropdownMenu>
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
        <UButton label="Sign up" color="neutral" to="/signup" block />
      </div>
    </template>
  </UHeader>
</template>
