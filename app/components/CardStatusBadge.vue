<script lang="ts" setup>
defineProps<{ card: Pick<Card, 'status'> }>();
</script>

<template>
  <UBadge
    :label="card.status"
    :color="
      {
        known: 'success' as const,
        learning: 'warning' as const,
        new: 'info' as const,
      }[card.status]
    "
    :icon="
      {
        known: 'i-lucide-graduation-cap',
        learning: 'i-lucide-circle-dashed',
        new: 'i-lucide-sparkles',
      }[card.status]
    "
    class="capitalize"
    variant="subtle"
  />
</template>

<style scoped></style>
