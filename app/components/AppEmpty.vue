<script lang="ts" setup>
const store = useDeckStore();
</script>

<template>
	<UEmpty
		:actions="[
      {
        to: '/library',
        icon: 'i-lucide-house',
        label: 'Home',
        color: 'success',
        variant: 'subtle',
        class: 'cursor-pointer hover:scale-102 hover:shadow',
      },
      {
        icon: 'i-lucide-refresh-cw',
        label: 'Restart',
        color: 'error',
        variant: 'outline',
        class: 'cursor-pointer hover:scale-102 hover:shadow',
        onClick: store.handleRestartDeck,
      },
    ]"
		variant="naked"
		icon="i-lucide-party-popper"
		title="You're all caught up — nothing to review now."
		description="Optimize your retention by strictly adhering to the next review date."
		size="xl"
	/>
</template>

<style></style>
