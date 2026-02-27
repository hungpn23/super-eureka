<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { breakpointsTailwind } from "@vueuse/core";
import * as v from "valibot";
import { type GetSharedDeckDetailResponse, Visibility } from "~/features/deck";
import type { ErrorResponse } from "~/shared/types";

definePageMeta({
	auth: false,
});

const schema = v.object({
	passcode: v.pipe(
		v.string(),
		v.minLength(4, "Passcode must be at least 4 characters"),
	),
});

type Schema = v.InferOutput<typeof schema>;

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { token } = useAuth();

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual("sm");

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);

const isFlipped = ref(false);
const isModalOpen = ref(false);

const state = reactive<Schema>({
	passcode: "",
});

const { data: deck, error } = await useFetch<
	GetSharedDeckDetailResponse,
	ErrorResponse
>(`/api/decks/shared/${route.query.deckId}`, {
	headers: { Authorization: token.value || "" },
});

watchImmediate(error, (newErr) => {
	if (newErr) toast.add({ title: "Error fetching deck", color: "error" });
});

async function onAddToLibrary() {
	if (!token.value) {
		toast.add({ title: "Please login first before adding deck to library" });
		router.push("/login");
		return;
	}

	if (deck.value?.visibility === Visibility.PROTECTED) {
		state.passcode = "";
		isModalOpen.value = true;
		return;
	}

	await cloneDeck();
}

async function handleSubmit(event: FormSubmitEvent<Schema>) {
	state.passcode = event.data.passcode;

	isModalOpen.value = false;
	await cloneDeck();
}

async function cloneDeck() {
	await $fetch(`/api/decks/clone/${deck.value?.id}`, {
		method: "POST",
		headers: { Authorization: token.value || "" },
		body: state,
	})
		.then(() => {
			toast.add({ title: "Deck added to library", color: "success" });
			router.push("/library");
		})
		.catch((err: ErrorResponse) => {
			toast.add({
				title: err.data?.message || "Failed to add deck",
				color: "error",
			});
		});
}

function toggleFlip() {
	isFlipped.value = !isFlipped.value;
}

defineShortcuts({
	" ": throttledToggleFlip,
});
</script>

<template>
  <UContainer>
    <UButton
      to="/shared"
      class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to shared"
    />

    <h1 class="text-lg font-semibold sm:text-xl">
      {{ deck?.name }}
    </h1>

    <p class="text-muted">
      {{ deck?.description }}
    </p>

    <div class="my-4 flex flex-col gap-4">
      <ClientOnly>
        <UAlert
          :actions="[
            {
              label: 'Add to Library',
              variant: 'subtle',
              icon: 'i-lucide-plus',
              onClick: () => onAddToLibrary(),
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
            v-if="deck && deck.cards[0]"
            class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl"
          >
            {{ !isFlipped ? deck.cards[0].term : deck.cards[0].definition }}
          </div>

          <div />
        </UCard>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="col-span-1 cursor-default">
            <UButton
              v-if="deck"
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

    <div v-if="deck" class="space-y-4">
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
          :schema="schema"
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
