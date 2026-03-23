<script setup lang="ts">
import type { Notification } from "~/features/notification";

const { notifications, unreadCount } = storeToRefs(useNotificationStore());

function handleReadNotification(notification: Notification) {
  notification.readAt = new Date().toISOString();
}
</script>

<template>
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
        class="max-w-2xs flex flex-col ring rounded-md ring-default divide-y divide-default text-sm"
      >
        <div class="flex place-items-center place-content-between gap-2">
          <p class="font-semibold px-2">Notifications</p>

          <UButton
            :label="`Read all ${unreadCount ? `(${unreadCount})` : ``}`"
            class="cursor-pointer"
            variant="link"
            color="neutral"
          />
        </div>

        <div class="max-h-72 overflow-y-auto">
          <p v-if="notifications.length === 0" class="text-muted p-2">
            No notifications
          </p>

          <NotificationItem
            v-for="n in notifications"
            :key="n.id"
            :notification="n"
          />
        </div>

        <UButton
          class="cursor-pointer"
          label="View all →"
          variant="link"
          color="neutral"
          to="/notifications"
          block
        />
      </div>
    </template>
  </UPopover>
</template>
