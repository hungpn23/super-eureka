<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui';

const { status, data: user } = useAuth();

const tabItems = ref<TabsItem[]>(profileTabItems);
</script>

<template>
  <span v-if="status === 'loading'">Loading...</span>

  <UContainer v-else-if="user" class="mt-4 md:max-w-4/5 lg:max-w-3/5">
    <UCard variant="subtle" class="sm:bg-elevated/50 bg-inherit ring-0 sm:ring">
      <div class="flex flex-col gap-2">
        <div class="flex place-content-between place-items-center gap-2">
          <div>
            <p class="text-xl font-medium sm:text-2xl">John Doe</p>
            <span class="font-medium">{{ user.username }}</span>
          </div>

          <UAvatar
            :ui="{ fallback: 'text-2xl uppercase' }"
            :src="user.avatarUrl || ''"
            :alt="user.username"
            class="size-20 rounded-full"
          />
        </div>

        <div class="flex flex-1 place-content-between gap-2">
          <div class="text-muted flex place-items-center gap-2">
            <UAvatarGroup size="2xs">
              <UAvatar
                src="https://github.com/benjamincanac.png"
                alt="Benjamin Canac"
              />
              <UAvatar src="https://github.com/romhml.png" alt="Romain Hamel" />
              <UAvatar src="https://github.com/noook.png" alt="Neil Richter" />
            </UAvatarGroup>

            <span class="text-sm sm:text-base">23 followers</span>
          </div>

          <UButton
            class="flex cursor-pointer place-self-end"
            label="Edit"
            icon="i-lucide-pen-line"
            variant="ghost"
            color="neutral"
          />
        </div>

        <UTabs :items="tabItems" :ui="{ trigger: 'w-full' }" variant="link" />
      </div>
    </UCard>
  </UContainer>
</template>

<style scoped></style>
