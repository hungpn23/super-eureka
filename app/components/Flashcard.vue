<script setup lang="ts">
type Props = {
  title?: string;
  deck: {
    id?: string;
    slug?: string;
  };
  cards: Card[];
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'answers-saved', answers: CardAnswer[]): void;
  (e: 'restarted'): void;
  (e: 'ignore-date'): void;
}>();

const isAnswersSaving = defineModel<boolean>('is-answers-saving');

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 300);

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

const learn = reactive<FlashcardState>({
  totalCards: 0,
  queue: [],
  answers: [],
  retryQueue: [],
});

const progress = computed(() => {
  if (!learn.totalCards) return 0;
  return (knownCount.value / learn.totalCards) * 100;
});

watchImmediate(
  () => props.cards,
  (newCards) => {
    if (newCards && newCards.length > 0) {
      knownCount.value = 0;
      skippedCount.value = 0;

      learn.answers = [];
      learn.retryQueue = [];
      learn.queue = newCards;
      learn.totalCards = learn.queue.length;

      flashcard.value = learn.queue.shift();
    }
  },
);

watch(flashcard, () => {
  isFlipped.value = false;
});

watchDebounced(learn, saveAnswers, {
  debounce: 1000,
  maxWait: 3000,
  deep: true,
});

async function saveAnswers() {
  const answersToSave = [...learn.answers];
  if (answersToSave.length === 0) return;

  $fetch(`/api/study/save-answer/${props.deck?.id}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
    body: { answers: answersToSave },
  })
    .then(() => {
      emit('answers-saved', answersToSave);
      learn.answers = [];
    })
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    })
    .finally(() => (isAnswersSaving.value = false));
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

  isAnswersSaving.value = true;

  const updated = Object.assign({}, updateCard(flashcard.value, correct));

  if (correct) {
    knownCount.value++;
  } else {
    skippedCount.value++;
    learn.retryQueue.push(updated);
  }

  // trigger watchDebounced
  const index = learn.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learn.answers[index] = updated;
  } else {
    learn.answers.push(updated);
  }

  if (!learn.queue.length) {
    if (!learn.retryQueue.length) {
      flashcard.value = undefined;
      return;
    }

    learn.queue = learn.retryQueue;
    learn.retryQueue = [];
  }

  flashcard.value = learn.queue.shift();
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

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <div>
    <slot name="routes"></slot>

    <div v-if="flashcard" class="flex w-full flex-col gap-2">
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

        <div>{{ `${knownCount} / ${learn.totalCards}` }}</div>

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
                playAudio(!isFlipped ? flashcard?.term : flashcard?.definition)
              "
            />
            {{ !isFlipped ? 'Term' : 'Definition' }}
          </span>

          <CardStatusBadge :card="flashcard" />
        </div>

        <div class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl">
          {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
        </div>

        <div></div>

        <template #header>
          <UProgress
            v-model="progress"
            :ui="{ base: 'bg-inherit' }"
            size="sm"
          />
        </template>
      </UCard>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="col-span-1">
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

        <div class="col-span-1 flex place-content-end gap-2">
          <slot name="actions-right"></slot>
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
  </div>
</template>
