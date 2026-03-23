<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";

const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");

const isShortcutOpen = ref(false);
</script>

<template>
	<UModal
		v-model:open="isShortcutOpen"
		:ui="{
      content: 'divide-none',
      body: 'flex-initial pt-0 sm:pt-0',
      footer: 'place-content-end',
    }"
		description="It helpful!"
	>
		<UButton
			v-if="smAndLarger"
			class="cursor-pointer"
			icon="i-lucide-keyboard"
			variant="ghost"
			color="neutral"
			size="lg"
			@click="isShortcutOpen = true"
		/>

		<template #title>
			<span class="text-lg font-medium">Keyboard shortcuts</span>
		</template>

		<template #body>
			<div class="flex flex-col gap-2">
				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Toggle color mode</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">`</UKbd>
					</div>
				</div>

				<USeparator label="Flashcard Mode" />

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Flip card</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">space</UKbd>
					</div>
				</div>

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Skip/Next card</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-move-left" />
						</UKbd>
						/
						<UKbd size="lg">
							<UIcon name="i-lucide-move-right" />
						</UKbd>
					</div>
				</div>

				<USeparator label="Learning Mode" />

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Choose an answer</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">1</UKbd>/<UKbd size="lg">2</UKbd>/
						<UKbd size="lg">3</UKbd>/<UKbd size="lg">4</UKbd>
					</div>
				</div>

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Get a hint</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-command" />
						</UKbd>
						<UKbd size="lg">Shift</UKbd>
						<UKbd size="lg">/</UKbd>
					</div>
				</div>

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Skip</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-command" />
						</UKbd>
						<UKbd size="lg">Shift</UKbd>
						<UKbd size="lg">X</UKbd>
					</div>
				</div>

				<USeparator label="Test Mode" />

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Previous/Next question</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-move-left" />
						</UKbd>
						/
						<UKbd size="lg">
							<UIcon name="i-lucide-move-right" />
						</UKbd>
					</div>
				</div>

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Mark as don't know</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-command" />
						</UKbd>
						<UKbd size="lg">Shift</UKbd>
						<UKbd size="lg">X</UKbd>
					</div>
				</div>

				<USeparator label="Routing" />

				<div class="flex place-content-between place-items-center gap-2">
					<span class="text-sm">Go back/forward</span>

					<div class="flex place-items-center gap-1">
						<UKbd size="lg">
							<UIcon name="i-lucide-command" />
						</UKbd>
						<UKbd size="lg">
							<UIcon name="i-lucide-move-left" />
						</UKbd>
						/
						<UKbd size="lg">
							<UIcon name="i-lucide-move-right" />
						</UKbd>
					</div>
				</div>
			</div>
		</template>
	</UModal>
</template>

<style scoped></style>
