<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";
import type { Notification } from "~/features/notification";

const props = defineProps<{
  notification: Notification;
}>();

const isRead = computed(() => !!props.notification.readAt);

function handleReadNotification() {
  props.notification.readAt = new Date().toISOString();
}
</script>

<template>
  <UAlert
    color="neutral"
    variant="soft"
    :ui="{
      root: `py-1 px-2 items-center cursor-pointer rounded-none hover:bg-accented/50 bg-elevated transition-all ${isRead ? 'bg-inherit' : ''}`,
      title: `leading-snug ${isRead ? 'font-normal' : ''}`,
      description: 'text-xs text-muted',
    }"
    :avatar="{
      src: notification.actor.avatarUrl ?? '',
      alt: notification.actor.username,
      icon: 'i-lucide-user',
      size: 'sm',
    }"
    :title="notification.content"
    :description="formatTimeAgo(new Date(props.notification.createdAt))"
    @click="handleReadNotification"
  />
</template>
