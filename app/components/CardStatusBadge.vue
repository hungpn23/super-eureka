<script lang="ts" setup>
import type { CardStatus } from "~/features/card";

defineProps<{ status: CardStatus }>();
</script>

<template>
	<UBadge
		:label="status"
		:color="
      {
        known: 'success' as const,
        learning: 'warning' as const,
        new: 'info' as const,
      }[status]
    "
		:icon="
      {
        known: 'i-lucide-graduation-cap',
        learning: 'i-lucide-alarm-clock',
        new: 'i-lucide-sparkles',
      }[status]
    "
		class="capitalize"
		variant="subtle"
	/>
</template>

<style scoped></style>
