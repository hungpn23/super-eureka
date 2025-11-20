<script lang="ts" setup>
const { getSession } = useAuth();
const user = await getSession();
</script>

<template>
  <UContainer>
    <h1>Profile Page</h1>
    <UCard>{{ user }}</UCard>
  </UContainer>
</template>

<style scoped></style>
