<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";
import type { Notification } from "~/features/notification";
import type { SuccessResponse } from "~/shared/types";

const { token } = useAuth();
const { notifications, unreadCount } = storeToRefs(useNotificationStore());
const { getRecentNotifications } = useNotificationStore();

async function handleReadNotification(n: Notification) {
  if (n.readAt) return;

  await $fetch<SuccessResponse>(`/api/notifications/read/${n.id}`, {
    method: "POST",
    headers: { Authorization: token.value || "" },
  }).catch(() => {});

  await getRecentNotifications();
}

async function handleReadAllNotifications() {
  if (unreadCount.value === 0) return;

  await $fetch<SuccessResponse>(`/api/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: token.value || "" },
  }).catch(() => {});

  await getRecentNotifications();
}
</script>

<template>
  <ClientOnly>
    <UPopover>
      <UChip inset :show="notifications.length !== 0">
        <UButton
          class="cursor-pointer"
          icon="i-lucide-bell"
          variant="ghost"
          color="neutral"
        />
      </UChip>

      <template #content>
        <div
          class="max-w-2xs flex flex-col rounded-md ring ring-default divide-y divide-default text-sm"
        >
          <div class="flex place-items-center place-content-between gap-2">
            <p class="font-semibold px-2">Notifications</p>

            <UButton
              :label="`Read all ${unreadCount ? `(${unreadCount})` : ``}`"
              class="cursor-pointer transition-all text-default hover:text-primary"
              variant="link"
              color="neutral"
              @click="handleReadAllNotifications"
            />
          </div>

          <div class="max-h-72 overflow-y-auto">
            <p v-if="notifications.length === 0" class="text-muted p-2">
              No notifications
            </p>

            <UAlert
              v-for="n in notifications"
              :key="n.id"
              color="neutral"
              variant="soft"
              :ui="{
                root: `py-1 px-2 items-center cursor-pointer rounded-none hover:bg-accented/50 bg-elevated transition-all ${n.readAt ? 'bg-inherit' : ''}`,
                title: `leading-snug ${n.readAt ? 'font-normal' : ''}`,
                description: 'text-xs text-muted',
              }"
              :avatar="{
                src: n.actor.avatarUrl ?? '',
                alt: n.actor.username,
                icon: 'i-lucide-user',
                size: 'sm',
              }"
              :title="n.content"
              :description="formatTimeAgo(new Date(n.createdAt))"
              @click="() => handleReadNotification(n)"
            />
          </div>

          <UButton
            class="cursor-pointer transition-all text-default hover:text-primary"
            label="View all →"
            variant="link"
            color="neutral"
            to="/notifications"
            block
          />
        </div>
      </template>
    </UPopover>
  </ClientOnly>
</template>
