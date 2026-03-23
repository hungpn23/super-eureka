<script setup lang="ts"></script>

<template>
	<USeparator class="mt-4 h-px" />

	<UFooter :ui="{ top: 'border-b border-default' }">
		<template #left>
			<p class="text-muted text-sm">
				Built with Nuxt UI • {{ new Date().getFullYear() }}
			</p>
		</template>
	</UFooter>
</template>
