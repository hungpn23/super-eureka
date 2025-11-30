<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true,
  },
});

useHead({
  htmlAttrs: {
    lang: 'en',
  },
});

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.',
});

const links = [
  {
    label: 'Docs',
    icon: 'i-lucide-book',
    to: '/docs/getting-started',
  },
  {
    label: 'Pricing',
    icon: 'i-lucide-credit-card',
    to: '/pricing',
  },
  {
    label: 'Blog',
    icon: 'i-lucide-pencil',
    to: '/blog',
  },
];
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <UToaster />
  </div>
</template>
