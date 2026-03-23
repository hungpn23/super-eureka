<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();

useHead({ htmlAttrs: { lang: "en" } });

useSeoMeta({
	title: "Page not found",
	description: "We are sorry but this page could not be found.",
});
</script>

<template>
	<div>
		<AppHeader />

		<UMain>
			<UContainer>
				<UPage>
					<UError
						:error="error"
						:clear="{
              class: 'rounded-full cursor-pointer',
              color: 'neutral',
              size: 'xl',
              icon: 'i-lucide-arrow-left',
            }"
						redirect="/library"
					/>
				</UPage>
			</UContainer>
		</UMain>

		<AppFooter />

		<UToaster />
	</div>
</template>
