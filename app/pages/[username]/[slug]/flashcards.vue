<script setup lang="ts">
const deckId = computed(() => {
  const q = useRoute().query.deckId;

  return Array.isArray(q) ? q[0] : q;
});
</script>

<template></template>
