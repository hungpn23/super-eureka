<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import {
	DeckFormId,
	type GetSharedDeckResponse,
	useDeckClone,
	useDeckToasts,
	Visibility,
} from "~/features/deck";
import { ShortcutKey } from "~/shared/enums";
import type { ErrorResponse, UUID } from "~/shared/types";
import { CLONE_DECK_SCHEMA } from "~/valibot/schemas";

definePageMeta({
	auth: false,
});

const route = useRoute();
const toast = useDeckToasts();
const { token } = useAuth();
const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");

const deckId = computed(() => route.query.deckId as UUID);

const { state, isModalOpen, isCloning, addToLibrary, handleSubmit } =
	useDeckClone(deckId);

const isFlipped = ref(false);

const { data: deck, error: getDeckError } = useFetch<
	GetSharedDeckResponse,
	ErrorResponse
>(
	computed(() => `/api/decks/shared/${deckId.value}`),
	{
		method: "GET",
		headers: { Authorization: token.value || "" },
	},
);

const throttledToggleFlip = useThrottleFn(() => {
	isFlipped.value = !isFlipped.value;
}, 300);

watch(getDeckError, () => {
	if (getDeckError.value) toast.getSharedDecksFailed();
});

defineShortcuts({
	[ShortcutKey.FLASHCARD_FLIP_CARD]: throttledToggleFlip,
});
</script>

<template>
	<UContainer v-if="deck">
		<UButton
			to="/shared"
			class="px-0"
			variant="link"
			label="Shared"
			icon="i-lucide-move-left"
			size="lg"
		/>

		<div class="flex place-content-between place-items-center gap-4">
			<h1 class="text-lg font-semibold sm:text-xl">{{ deck.name }}</h1>

			<UButton label="Add to library" @click="addToLibrary(deck!.visibility)" />
		</div>

		<p class="text-muted">{{ deck.description }}</p>

		<div class="space-y-2 mt-4">
			<UCard
				:ui="{
            body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
          }"
				class="bg-elevated flex min-h-[50dvh] flex-col divide-none"
				variant="subtle"
				@click="throttledToggleFlip"
			>
				<div class="flex w-full place-content-between place-items-center">
					<span class="flex place-items-center gap-1 font-medium">
						<UButton
							class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
							icon="i-lucide-volume-2"
							variant="soft"
							color="neutral"
							@click.stop="console.log('TTS not implemented yet')"
						/>

						{{ !isFlipped ? "Term" : "Definition" }}
					</span>
				</div>

				<div
					v-if="deck.cards[0]"
					class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl"
				>
					{{ !isFlipped ? deck.cards[0].term : deck.cards[0].definition }}
				</div>

				<div />
			</UCard>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<UUser
					v-if="deck.owner.id"
					class="col-span-1"
					target="_self"
					description="Owner"
					:to="`/shared/${deck.owner.username}`"
					:name="deck.owner.username"
					:avatar="{
              src: deck.owner.avatar?.url || '',
              alt: deck.owner.username,
              loading: 'lazy',
              icon: 'i-lucide-user',
            }"
				/>

				<div
					class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
				>
					<UButton
						label="Skip"
						icon="i-lucide-x"
						size="lg"
						variant="subtle"
						color="error"
						disabled
					/>

					<UButton
						label="Next"
						icon="i-lucide-check-check"
						size="lg"
						variant="subtle"
						color="success"
						disabled
					/>
				</div>
			</div>
		</div>

		<USeparator class="my-6" />

		<div class="mt-4 space-y-4">
			<UCollapsible class="space-y-4" :default-open="false">
				<template #default="{ open }">
					<div
						class="group flex place-content-between place-items-center gap-3 cursor-pointer hover:text-primary"
					>
						<h2 class="text-lg font-medium sm:text-xl">
							Cards ({{ deck.totalCards }})
						</h2>

						<UIcon
							:name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
							class="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
						/>
					</div>
				</template>

				<template #content>
					<div class="space-y-4">
						<TransitionGroup name="list" appear>
							<UCard
								v-for="(card, index) in deck.cards"
								:key="index"
								class="bg-elevated mx-0.5 first:mt-0.5 last:mb-0.5"
								variant="subtle"
							>
								<div class="flex flex-col sm:flex-row">
									<p class="w-full text-base font-medium sm:text-lg">
										{{ card.term }}
									</p>

									<USeparator class="m-2 sm:hidden" />

									<USeparator
										orientation="vertical"
										class="m-2 hidden h-auto sm:block"
									/>

									<p class="w-full text-base font-medium sm:text-lg">
										{{ card.definition }}
									</p>
								</div>
							</UCard>
						</TransitionGroup>
					</div>
				</template>
			</UCollapsible>

			<div v-if="deck.visibility === Visibility.PUBLIC" class="pt-2">
				<AppCusdis
					:key="`shared-deck:${deck.id}`"
					:page-id="`shared-deck:${deck.id}`"
					:page-title="deck.name"
				/>
			</div>
		</div>

		<UModal
			v-model:open="isModalOpen"
			:ui="{ footer: 'place-content-end' }"
			title="Hold on!"
			description="This deck is protected. Please enter the passcode to continue."
		>
			<template #body>
				<UForm
					:id="DeckFormId.CLONE_DECK"
					:schema="CLONE_DECK_SCHEMA"
					:state="state"
					@submit="handleSubmit"
				>
					<UFormField name="passcode" label="Passcode" required>
						<UInput
							v-model="state.passcode"
							type="password"
							placeholder="Enter passcode"
							autofocus
						/>
					</UFormField>
				</UForm>
			</template>

			<template #footer="{ close }">
				<UButton
					label="Cancel"
					color="neutral"
					variant="outline"
					@click="close"
				/>

				<UButton :form="DeckFormId.CLONE_DECK" type="submit">
					Add to Library
				</UButton>
			</template>
		</UModal>
	</UContainer>
</template>

<style scoped></style>
