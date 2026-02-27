<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import {
	api,
	CLONE_DECK_SCHEMA,
	useDeckClone,
	useDeckToasts,
} from "~/features/deck";
import type { UUID } from "~/shared/types";

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

const { data: deck, error: getDeckError } = api.getSharedDeckDetail({
	deckId,
	token,
});

const throttledToggleFlip = useThrottleFn(() => {
	isFlipped.value = !isFlipped.value;
}, 300);

watch(getDeckError, () => {
	if (getDeckError.value) toast.getSharedDecksFailed();
});

defineShortcuts({
	" ": throttledToggleFlip,
});
</script>

<template>
  <UContainer v-if="deck">
    <UButton
      to="/shared"
      class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to shared"
    />

    <h1 class="text-lg font-semibold sm:text-xl">
      {{ deck.name }}
    </h1>

    <p class="text-muted">
      {{ deck.description }}
    </p>

    <div class="my-4 flex flex-col gap-4">
      <ClientOnly>
        <UAlert
          :actions="[
            {
              label: 'Add to Library',
              variant: 'subtle',
              icon: 'i-lucide-plus',
              disabled: isCloning,
              onClick: () => addToLibrary(deck!.visibility),
            },
          ]"
          :orientation="smAndLarger ? 'horizontal' : 'vertical'"
          :ui="{ icon: 'place-self-start' }"
          title="Attention!"
          description="Add this deck to your library for learning."
          icon="i-lucide-terminal"
          color="info"
          variant="outline"
        />
      </ClientOnly>

      <div class="space-y-2">
        <UCard
          :ui="{
            body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
          }"
          class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
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

              {{ !isFlipped ? 'Term' : 'Definition' }}
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
          <div class="col-span-1 cursor-default">
            <UButton
              class="w-fit p-0 hover:bg-inherit active:bg-inherit"
              variant="ghost"
              color="neutral"
            >
              <div class="flex place-items-center gap-2">
                <UAvatar
                  :ui="{ fallback: 'uppercase' }"
                  :src="deck.owner.avatarUrl || ''"
                  :alt="deck.owner.username"
                  class="cursor-pointer"
                  size="xl"
                />

                <div class="flex flex-col place-items-start">
                  <span class="text-muted text-sm font-normal">Owner</span>

                  <NuxtLink
                    :to="`/shared/${deck.owner.username}`"
                    class="cursor-default text-base font-medium hover:underline"
                  >
                    {{ deck.owner.username }}
                  </NuxtLink>
                </div>
              </div>
            </UButton>
          </div>

          <div
            class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
          >
            <UButton
              label="Skip"
              icon="i-heroicons-x-mark"
              size="lg"
              variant="subtle"
              color="error"
              disabled
            />

            <UButton
              label="Next"
              icon="i-heroicons-check"
              size="lg"
              variant="subtle"
              color="success"
              disabled
            />
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-6" />

    <div class="space-y-4">
      <h2 class="text-lg font-medium sm:text-xl">
        Cards ({{ deck.totalCards }})
      </h2>

      <TransitionGroup name="list" appear>
        <UCard
          v-for="(card, index) in deck.cards"
          :key="index"
          class="bg-elevated shadow-md"
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

    <UModal
      v-model:open="isModalOpen"
      :ui="{ footer: 'place-content-end' }"
      title="Hold on!"
      description="This deck is protected. Please enter the passcode to continue."
    >
      <template #body>
        <UForm
          id="passcode-form"
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

        <UButton form="passcode-form" type="submit">Add to Library</UButton>
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped></style>
