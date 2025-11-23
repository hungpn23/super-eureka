<script setup lang="ts">
type Props = {
  title: string;
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
  (e: 'answers-saved', answers: CardAnswer[]): void;
  (e: 'restarted'): void;
  (e: 'ignore-date'): void;
}>();

const { token } = useAuth();

// --- Text-to-Speech Setup ---
const textToSpeech = ref('');
const { speak, stop } = useSpeechSynthesis(textToSpeech, {
  lang: 'en-US',
  rate: 0.9,
});

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
      emit('answers-saved', answersToSave);
      learnState.answers = [];
    })
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    });
}

async function restart() {
  $fetch(`/api/decks/restart/${props.deck?.id}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  }).then(() => emit('restarted'));
}

function handleAnswer(correct: boolean) {
  if (!flashcard.value) return;

  const updated = Object.assign(
    {},
    flashcard.value,
    calcCardState({
      ...flashcard.value,
      correct,
    }),
  );

  if (correct) {
    knownCount.value++;
  } else {
    skippedCount.value++;
    learnState.retryQueue.push(updated);
  }

  // trigger watchDebounced
  const index = learnState.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learnState.answers[index] = updated;
  } else {
    learnState.answers.push(updated);
  }

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

function playAudio(text?: string) {
  if (!text) return;
  stop();
  textToSpeech.value = text;
  speak();
}

function toggleFlip() {
  if (!flashcard.value) return;
  isFlipped.value = !isFlipped.value;
}

const throttledToggleFlip = useThrottleFn(toggleFlip, 50);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 50);

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <ClientOnly>
    <slot name="routes"></slot>

    <div v-if="pending" class="flex justify-center p-10">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
    </div>

    <div v-else-if="flashcard" class="flex w-full flex-col gap-2">
      <h1
        v-if="title"
        class="mb-2 place-self-center text-lg font-semibold sm:text-xl"
      >
        {{ title }}
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

        <div>{{ `${knownCount} / ${learnState.totalCards}` }}</div>

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

      <UProgress
        v-model="progress"
        :ui="{ base: 'bg-elevated/50' }"
        class="ring-default rounded-lg shadow ring"
      />

      <UCard
        :ui="{
          body: 'p-2 sm:p-4 sm:pt-2 w-full flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
        }"
        class="flex min-h-[50dvh] shadow-md"
        variant="subtle"
        @click="throttledToggleFlip"
      >
        <div class="flex w-full place-content-between place-items-center">
          <span class="flex place-items-center gap-1 font-bold">
            <UButton
              class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
              icon="i-lucide-volume-2"
              variant="soft"
              color="neutral"
              @click.stop="
                playAudio(!isFlipped ? flashcard?.term : flashcard?.definition)
              "
            />
            {{ !isFlipped ? 'Term' : 'Definition' }}
          </span>

          <UBadge
            :label="flashcard.status"
            :color="
              {
                known: 'success' as const,
                learning: 'warning' as const,
                new: 'info' as const,
              }[flashcard.status]
            "
            class="capitalize"
            variant="subtle"
          />
        </div>

        <div class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl">
          {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
        </div>

        <div></div>
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
              class="cursor-pointer transition-all hover:scale-105 hover:shadow active:scale-90"
              @click="throttledHandleAnswer(false)"
            />
          </UTooltip>

          <UTooltip :delay-duration="0" :kbds="['arrowright']" text="Next">
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

        <div class="col-span-1 flex place-content-end place-items-center gap-2">
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
          icon: 'i-lucide-refresh-cw',
          label: 'Restart',
          color: 'error',
          variant: 'outline',
          class: 'cursor-pointer hover:scale-102 hover:shadow',
          onClick: restart,
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
  </ClientOnly>
</template>
