<script setup lang="ts">
type Props = {
  username: string;
  deck: {
    id?: string;
    slug?: string;
  };
  cards: Card[];
  pending: boolean;
};

const props = defineProps<Partial<Props>>();

const emit = defineEmits<{
  (e: 'saved', answers: CardAnswer[]): void;
  (e: 'refresh-data'): void;
  (e: 'ignore-date'): void;
}>();

const { token } = useAuth();

const isFlipped = ref(false);

const knownCount = ref(0);
const skippedCount = ref(0);
const flashcard = ref<Card | undefined>(undefined);

const learnState = reactive<FlashcardState>({
  totalCards: 0,
  queue: [],
  answers: [],
  retryQueue: [],
});

const progress = computed(() => {
  if (!learnState.totalCards) return 0;
  return (knownCount.value / learnState.totalCards) * 100;
});

watch(
  () => props.cards,
  (newCards) => {
    if (newCards && newCards.length > 0) {
      knownCount.value = 0;
      skippedCount.value = 0;

      learnState.answers = [];
      learnState.retryQueue = [];
      learnState.queue = newCards;
      learnState.totalCards = learnState.queue.length;

      flashcard.value = learnState.queue.shift();
    }
  },
  { immediate: true },
);

watch(flashcard, () => {
  isFlipped.value = false;
});

watchDebounced(learnState, saveAnswers, {
  debounce: 1000,
  maxWait: 3000,
  deep: true,
});

async function saveAnswers() {
  const answersToSave = [...learnState.answers];
  if (answersToSave.length === 0) return;

  $fetch(`/api/study/save-answer/${props.deck?.id}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
    body: { answers: answersToSave },
  })
    .then(() => {
      emit('saved', answersToSave);
      learnState.answers = [];
    })
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    });
}

async function refreshDeckProgress() {
  $fetch(`/api/decks/refresh/${props.deck?.id}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  }).then(() => emit('refresh-data'));
}

function handleAnswer(isCorrect: boolean) {
  if (!flashcard.value) return;

  const updated = Object.assign(
    {},
    flashcard.value,
    calcCardState({
      ...flashcard.value,
      isCorrect,
    }),
  );

  // update stats & retry queue
  if (isCorrect) {
    knownCount.value++;
  } else {
    skippedCount.value++;
    learnState.retryQueue.push(updated);
  }

  // update answers (trigger watchDebounced)
  const index = learnState.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learnState.answers[index] = updated;
  } else {
    learnState.answers.push(updated);
  }

  // next Card Logic
  if (!learnState.queue.length) {
    if (!learnState.retryQueue.length) {
      flashcard.value = undefined;
      return;
    }

    learnState.queue = learnState.retryQueue;
    learnState.retryQueue = [];
  }

  flashcard.value = learnState.queue.shift();
}

function toggleFlip() {
  if (!flashcard.value) return;
  isFlipped.value = !isFlipped.value;
}

const throttledToggleFlip = useThrottleFn(toggleFlip, 200);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 200);

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <ClientOnly>
    <div class="flex w-full flex-col gap-4">
      <div class="flex place-content-between place-items-center">
        <UButton
          :to="`/${username}/${props.deck?.slug}?deckId=${props.deck?.id}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          icon="i-lucide-move-left"
          label="Go back"
        />

        <UButton
          :to="`/${username}/${props.deck?.slug}/learn?deckId=${props.deck?.id}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          trailing-icon="i-lucide-move-right"
          label="Go to Learn"
        />
      </div>

      <div v-if="pending" class="flex justify-center p-10">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
      </div>

      <div v-else-if="flashcard" class="flex w-full flex-col gap-2">
        <slot name="header"></slot>

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

        <UProgress v-model="progress" :ui="{ base: 'bg-elevated' }" />

        <UCard
          :ui="{
            body: 'grow flex place-items-center text-left text-2xl font-semibold px-6 sm:px-12 sm:text-3xl',
          }"
          variant="soft"
          class="bg-elevated flex min-h-[50dvh] w-full cursor-pointer flex-col place-items-center divide-none text-center shadow-md select-none"
          @click="throttledToggleFlip"
        >
          {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
        </UCard>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div class="col-span-1 hidden sm:block">
            <slot name="actions-left"></slot>
          </div>

          <div
            class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
          >
            <UTooltip :delay-duration="0" :kbds="['arrowleft']" text="Skip">
              <UButton
                label="Skip"
                icon="i-heroicons-x-mark"
                size="lg"
                variant="subtle"
                color="error"
                class="cursor-pointer transition-transform hover:shadow active:scale-90"
                @click="throttledHandleAnswer(false)"
              />
            </UTooltip>

            <UTooltip :delay-duration="0" :kbds="['arrowright']" text="Next">
              <UButton
                label="Next"
                icon="i-heroicons-check"
                size="lg"
                variant="subtle"
                class="cursor-pointer transition-transform hover:shadow active:scale-90"
                @click="throttledHandleAnswer(true)"
              />
            </UTooltip>
          </div>

          <div
            class="col-span-1 flex place-content-end place-items-center gap-2"
          >
            <slot name="actions-right"></slot>
          </div>
        </div>

        <div
          class="hidden w-full place-content-center place-items-center gap-2 rounded-md p-2 text-current sm:px-4 lg:flex"
        >
          <span
            class="inline-flex place-content-center place-items-center gap-2 rounded-md border border-current px-2 py-0.5 font-bold"
          >
            <UIcon class="size-5" name="i-lucide-keyboard" />
            <span>Shortcuts</span>
          </span>
          Press <Kbd label="Space" /> to flip,
          <Kbd :icon="{ name: 'i-lucide-move-right' }" /> to move next,
          <Kbd :icon="{ name: 'i-lucide-move-left' }" /> to skip.
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
            icon: 'i-lucide-fast-forward',
            label: 'Ignore & continue',
            color: 'neutral',
            variant: 'subtle',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: () => emit('ignore-date'),
          },
          {
            icon: 'i-lucide-refresh-cw',
            label: 'Refresh progress',
            color: 'error',
            variant: 'outline',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: refreshDeckProgress,
          },
        ]"
        variant="naked"
        icon="i-lucide-party-popper"
        title="You're all caught up — nothing to review now."
        description="Optimize your retention by strictly adhering to the next review date."
        size="xl"
      />
    </div>
  </ClientOnly>
</template>
