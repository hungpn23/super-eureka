<template>
	<div class="flex h-screen place-items-center place-content-center px-4">
		<UButton
			icon="i-lucide-chevron-left"
			to="/"
			size="xl"
			color="neutral"
			variant="subtle"
			class="absolute top-8 left-8 z-10 rounded-full"
		/>

		<UPageCard
			:ui="{ container: 'p-0' }"
			variant="subtle"
			class="sm:bg-elevated/50 sm:ring-default w-full max-w-sm bg-inherit ring-0 sm:ring"
		>
			<slot />
		</UPageCard>
	</div>
</template>
