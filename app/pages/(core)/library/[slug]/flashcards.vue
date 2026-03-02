<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { breakpointsTailwind } from "@vueuse/core";
import { useFlashcardSession } from "~/features/deck";
import { ShortcutKey } from "~/shared/enums";

const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const store = useDeckStore();

const { session, progress, handleAnswer, shuffleCards } = useFlashcardSession();

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 300);

const isFlipped = ref(false);

const settingOptions = computed<DropdownMenuItem[]>(() => [
	[
		{
			label: "Restart progress",
			icon: "i-lucide-refresh-cw",
			color: "warning",
			onSelect: store.handleRestartDeck,
		},
		{
			label: "Ignore review dates",
			icon: `i-lucide-calendar${store.isIgnoreDate ? "-off" : ""}`,
			type: "checkbox",
			checked: store.isIgnoreDate,
			onUpdateChecked: (checked: boolean) =>
				store.handleCheckIgnoreDate(checked),
			onSelect: (e: Event) => e.preventDefault(),
		},
	],
]);

watch(
	() => session.currentCard,
	() => {
		isFlipped.value = false;
	},
);

function toggleFlip() {
	if (!session.currentCard) return;
	isFlipped.value = !isFlipped.value;
}

defineShortcuts({
	[ShortcutKey.FLASHCARD_FLIP_CARD]: throttledToggleFlip,
	[ShortcutKey.NEXT_CARD]: () => throttledHandleAnswer(true),
	[ShortcutKey.PREV_CARD]: () => throttledHandleAnswer(false),
});
</script>

<template>
  <SkeletonFlashcardsPage v-if="store.isFetchingDeck" />

  <UContainer v-else>
    <div class="flex place-content-between place-items-center gap-2">
      <UButton
        :to="`/library/${store.slug}?deckId=${store.deckId}`"
        :label="smAndLarger ? 'Back to Home' : 'Home'"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        icon="i-lucide-move-left"
      />

      <UButton
        :to="`/library/${store.slug}/learn?deckId=${store.deckId}`"
        :label="smAndLarger ? 'Go to Learn' : 'Learn'"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        trailing-icon="i-lucide-move-right"
      />
    </div>

    <div v-if="session.currentCard" class="flex w-full flex-col gap-2">
      <h1
        v-if="store.deck?.name"
        class="mb-2 place-self-center text-lg font-semibold sm:text-xl"
      >
        {{ store.deck?.name }}
      </h1>

      <div class="flex place-content-between">
        <div class="flex place-items-center gap-2">
          <UBadge
            :label="session.skippedCount"
            class="rounded-full px-2"
            variant="subtle"
            color="error"
          />

          <span class="text-error text-sm">Skipped</span>
        </div>

        <div>
          {{ `${session.knownCount} / ${session.totalCards}` }}
        </div>

        <div class="flex place-items-center gap-2">
          <span class="text-success text-sm">Known</span>

          <UBadge
            :label="session.knownCount"
            class="rounded-full px-2"
            variant="subtle"
            color="success"
          />
        </div>
      </div>

      <UCard
        :ui="{
          header: 'p-0 sm:px-0',
          body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
        }"
        class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
        variant="subtle"
        @click="throttledToggleFlip"
      >
        <template #header>
          <UProgress
            :model-value="progress"
            :ui="{ base: 'bg-inherit' }"
            size="sm"
          />
        </template>

        <template #default>
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-medium">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
                @click.stop="console.log('TTS not implemented yet')"
              />

              <span>
                {{
                  !isFlipped
                    ? `Term (${session.currentCard.termLanguage})`
                    : `Definition (${session.currentCard.definitionLanguage})`
                }}
              </span>
            </span>

            <CardStatusBadge :card="session.currentCard" />
          </div>

          <div
            v-if="isFlipped"
            class="flex w-full flex-col place-content-evenly place-items-stretch gap-6 px-2 sm:flex-row"
          >
            <div class="flex flex-col place-content-evenly gap-2">
              <div class="text-xl font-medium sm:text-2xl">
                {{ session.currentCard.definition }}
              </div>

              <div v-if="session.currentCard.examples.length">
                <p class="text-sm font-medium">Examples:</p>

                <ul class="list-disc pl-4">
                  <li
                    v-for="(example, i) in session.currentCard.examples"
                    :key="i"
                  >
                    <em>
                      {{ example }}

                      <span v-if="!example.endsWith('.')">.</span>
                    </em>
                  </li>
                </ul>
              </div>
            </div>

            <NuxtImg
              src="https://avatars.githubusercontent.com/u/177613774?v=4"
              alt="User avatar"
            />
          </div>

          <div v-else class="flex flex-col place-items-center sm:px-4">
            <div class="space-x-2">
              <span class="text-2xl font-medium sm:text-3xl">
                {{ session.currentCard.term }}
              </span>

              <span v-if="session.currentCard.partOfSpeech">
                ({{ session.currentCard.partOfSpeech }})
              </span>
            </div>

            <em v-if="session.currentCard.pronunciation">
              {{ session.currentCard.pronunciation }}
            </em>
          </div>

          <div />
        </template>
      </UCard>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="col-span-1" />

        <div
          class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
        >
          <UTooltip :delay-duration="200" :kbds="['arrowleft']" text="Skip">
            <UButton
              label="Skip"
              icon="i-heroicons-x-mark"
              size="lg"
              variant="subtle"
              color="error"
              class="cursor-pointer transition-all hover:scale-105 hover:shadow active:scale-90"
              @click="throttledHandleAnswer(false)"
            />
          </UTooltip>

          <UTooltip :delay-duration="200" :kbds="['arrowright']" text="Next">
            <UButton
              label="Next"
              icon="i-heroicons-check"
              size="lg"
              variant="subtle"
              color="success"
              class="cursor-pointer transition-all hover:scale-105 hover:shadow active:scale-90"
              @click="throttledHandleAnswer(true)"
            />
          </UTooltip>
        </div>

        <div class="col-span-1 flex place-content-end gap-2">
          <UButton
            class="cursor-pointer transition-all active:scale-80"
            color="neutral"
            icon="i-lucide-shuffle"
            variant="ghost"
            size="lg"
            @click="shuffleCards"
          />

          <UDropdownMenu :items="settingOptions">
            <UButton
              class="cursor-pointer"
              color="neutral"
              icon="i-lucide-settings"
              variant="ghost"
              size="lg"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>

    <AppEmpty v-else />
  </UContainer>
</template>
