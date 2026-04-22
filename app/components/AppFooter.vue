<script setup lang="ts"></script>

<template>
	<USeparator class="h-px" />

	<UFooter :ui="{container: 'py-4 p-0'}">
		<template #default>
			<p class="text-muted text-sm">
				Built with Nuxt UI • {{ new Date().getFullYear() }}
			</p>
		</template>
	</UFooter>
</template>
