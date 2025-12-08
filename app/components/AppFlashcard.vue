<script setup lang="ts">
type Props = {
  deck: {
    id?: string;
    title?: string;
    slug?: string;
  };
  card?: Card;
  totalCards: number;
  knownCount: number;
  skippedCount: number;
  progress: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'restarted' | 'ignore-date'): void;
  (e: 'answer', correct: boolean): void;
}>();

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);
const throttledHandleAnswer = useThrottleFn(onAnswer, 300);

// --- Text-to-Speech Setup ---
const textToSpeech = ref('');
const { speak, stop } = useSpeechSynthesis(textToSpeech);

const isFlipped = ref(false);

watch(
  () => props.card,
  () => (isFlipped.value = false),
);

function onAnswer(correct: boolean) {
  emit('answer', correct);
}

function playAudio(text?: string) {
  if (!text) return;
  stop();
  textToSpeech.value = text;
  speak();
}

function toggleFlip() {
  if (!props.card) return;
  isFlipped.value = !isFlipped.value;
}

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <div>
    <slot name="routes" />

    <div v-if="card" class="flex w-full flex-col gap-2">
      <h1
        v-if="deck.title"
        class="mb-2 place-self-center text-lg font-semibold sm:text-xl"
      >
        {{ deck.title }}
      </h1>

      <div class="flex place-content-between">
        <div class="flex place-items-center gap-2">
          <UBadge
            :label="skippedCount"
            class="rounded-full px-2"
            variant="subtle"
            color="error"
          />

          <span class="text-error text-sm">Skipped</span>
        </div>

        <div>{{ `${knownCount} / ${totalCards}` }}</div>

        <div class="flex place-items-center gap-2">
          <span class="text-success text-sm">Known</span>

          <UBadge
            :label="knownCount"
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
              @click.stop="
                playAudio(!isFlipped ? card?.term : card?.definition)
              "
            />
            {{ !isFlipped ? 'Term' : 'Definition' }}
          </span>

          <CardStatusBadge :card="card" />
        </div>

        <div class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl">
          {{ !isFlipped ? card?.term : card?.definition }}
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
        <div class="col-span-1">
          <slot name="actions-left" />
        </div>

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
          <slot name="actions-right" />
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      :actions="[
        {
          to: '/home',
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
          onClick: () => emit('restarted'),
        },
        {
          icon: 'i-lucide-fast-forward',
          label: 'Ignore & continue',
          color: 'neutral',
          variant: 'subtle',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
          onClick: () => emit('ignore-date'),
        },
      ]"
      variant="naked"
      icon="i-lucide-party-popper"
      title="You're all caught up — nothing to review now."
      description="Optimize your retention by strictly adhering to the next review date."
      size="xl"
    />
  </div>
</template>
