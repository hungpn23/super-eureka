<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { breakpointsTailwind } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');
const store = useDeckStore();

const { session, progress, handleAnswer, shuffleCards } = useFlashcardSession();

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 300);

const isFlipped = ref(false);

const settingOptions = computed<DropdownMenuItem[]>(() => [
  [
    {
      label: 'Restart progress',
      icon: 'i-lucide-refresh-cw',
      color: 'warning',
      onSelect: store.restartDeck,
    },
    {
      label: 'Ignore review dates',
      icon: `i-lucide-calendar${store.isIgnoreDate ? '-off' : ''}`,
      type: 'checkbox',
      checked: store.isIgnoreDate,
      onUpdateChecked: (checked: boolean) => store.updateIgnoreDate(checked),
      onSelect: (e: Event) => e.preventDefault(),
    },
  ],
]);

watch(
  () => session.currentCard,
  () => (isFlipped.value = false),
);

function toggleFlip() {
  if (!session.currentCard) return;
  isFlipped.value = !isFlipped.value;
}

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <SkeletonFlashcardsPage
    v-if="store.status === 'idle' || store.status === 'pending'"
  />

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

          <CardStatusBadge :card="session.currentCard" />
        </div>

        <div class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl">
          {{
            !isFlipped
              ? session.currentCard?.term
              : session.currentCard?.definition
          }}
        </div>

        <div />

        <template #header>
          <UProgress
            :model-value="progress"
            :ui="{ base: 'bg-inherit' }"
            size="sm"
          />
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

    <UEmpty
      v-else
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
          onClick: store.restartDeck,
        },
        {
          icon: 'i-lucide-fast-forward',
          label: 'Ignore & continue',
          color: 'neutral',
          variant: 'subtle',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
          onClick: () => store.updateIgnoreDate(true),
        },
      ]"
      variant="naked"
      icon="i-lucide-party-popper"
      title="You're all caught up — nothing to review now."
      description="Optimize your retention by strictly adhering to the next review date."
      size="xl"
    />
  </UContainer>
</template>
