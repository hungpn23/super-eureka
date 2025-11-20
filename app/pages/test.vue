<script setup lang="ts">
// ... imports cũ
import calcCardState from "~/utils/calcCardState"; // Giả sử đường dẫn import

// Định nghĩa Type cho kết quả trả về để lưu vào DB sau này
type CardAnswer = {
  cardId: UUID;
  correctCount: number;
  nextReviewDate: string;
};

/**
 * START LEARNING LOGIC
 */
const isFlipped = ref(false);
const shortcutPressed = ref(false);
const learnCards = ref<Card[]>([]);
const learnIndex = ref(0);
const answers = ref<CardAnswer[]>([]); // Mảng chứa kết quả

// Reset state khi data fetch xong
watchEffect(() => {
  if (res.value?.cards) {
    learnCards.value = structuredClone(res.value.cards);
    learnIndex.value = 0;
    answers.value = [];
    isFlipped.value = false;
  }
});

const currentCard = computed(() => learnCards.value[learnIndex.value]);
const isFinished = computed(
  () =>
    learnIndex.value >= learnCards.value.length && learnCards.value.length > 0,
);

// Tính toán progress dựa trên số câu đã làm
const progress = computed(() => {
  if (learnCards.value.length === 0) return 0;
  return (learnIndex.value / learnCards.value.length) * 100;
});

function flipCard() {
  if (!currentCard.value) return;
  if (!shortcutPressed.value) shortcutPressed.value = true;
  isFlipped.value = !isFlipped.value;
}

// Hàm xử lý logic chung cho việc trả lời
function handleAnswer(isCorrect: boolean) {
  if (!currentCard.value) return;

  // 1. Tính toán trạng thái mới dựa trên hàm calcCardState
  const { correctCount, nextReviewDate } = calcCardState({
    correctCount: currentCard.value.correctCount || 0, // Giả sử Card có field correctCount
    isCorrect: isCorrect,
  });

  // 2. Lưu vào mảng answers
  answers.value.push({
    cardId: currentCard.value.id,
    correctCount,
    nextReviewDate,
  });

  // 3. Chuyển sang card tiếp theo
  isFlipped.value = false;
  shortcutPressed.value = false; // Reset trạng thái phím tắt hướng dẫn
  learnIndex.value++;
}

function onSkip() {
  handleAnswer(false); // Sai -> Skip/Wrong
}

function onNext() {
  handleAnswer(true); // Đúng -> Next/Correct
}

function shuffleCards() {
  // Logic shuffle sau này
}

// Bổ sung phím tắt: Space (Lật), Mũi tên trái (Sai), Mũi tên phải (Đúng)
defineShortcuts({
  " ": flipCard,
  arrowleft: {
    handler: onSkip,
  },
  arrowright: {
    handler: onNext,
  },
});
/**
 * END LEARNING LOGIC
 */
</script>

<template>
  <div class="flex flex-col gap-2">
    <UProgress v-model="progress" animation="carousel" />

    <div
      v-if="isFinished"
      class="flex min-h-[50dvh] flex-col items-center justify-center gap-6 text-center"
    >
      <UBanner
        icon="i-lucide-party-popper"
        color="success"
        :title="`You have reviewed ${learnCards.length} cards!`"
        description="Great job! Your progress has been recorded."
        :actions="[
          {
            label: 'Review Again',
            variant: 'solid',
            color: 'primary',
            onClick: refresh,
          },
          { label: 'Back to Dashboard', variant: 'outline', to: '/home' },
        ]"
      />
      <div class="text-xs text-gray-400">
        Recorded {{ answers.length }} answers.
      </div>
    </div>

    <div v-else class="contents">
      <UCard
        :ui="{
          body: 'flex-grow flex place-items-center justify-center text-left text-2xl font-semibold px-6 sm:px-12 sm:text-3xl min-h-[300px]',
          footer:
            'w-full bg-secondary/25 flex place-content-center place-items-center gap-2 p-2 sm:px-4',
        }"
        variant="soft"
        class="bg-elevated flex min-h-[50dvh] w-full cursor-pointer flex-col place-items-center divide-none text-center transition-all"
        @click="flipCard"
      >
        <div
          class="animate-in fade-in zoom-in duration-300"
          :key="currentCard?.id + isFlipped.toString()"
        >
          {{ !isFlipped ? currentCard?.term : currentCard?.definition }}
        </div>

        <template #footer v-if="!shortcutPressed">
          <span
            class="hidden place-content-center place-items-center gap-2 rounded-md border border-current px-2 py-0.5 font-bold sm:inline-flex"
          >
            <UIcon class="size-5" name="i-lucide-keyboard" />
            <span>Shortcut</span>
          </span>
          Press
          <span
            class="bg-elevated mx-1 inline-flex rounded-sm border-b-3 border-b-current/90 px-1 font-medium"
            >Space</span
          >
          to flip,
          <span
            class="bg-elevated mx-1 inline-flex rounded-sm border-b-3 border-b-current/90 px-1 font-medium"
            ><UIcon name="i-lucide-arrow-left"
          /></span>
          /
          <span
            class="bg-elevated mx-1 inline-flex rounded-sm border-b-3 border-b-current/90 px-1 font-medium"
            ><UIcon name="i-lucide-arrow-right"
          /></span>
          to vote.
        </template>
      </UCard>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <UButton
          :to="`/${user?.username}`"
          variant="link"
          color="neutral"
          class="w-fit p-0"
        >
          <div class="flex place-items-center gap-2">
            <UAvatar :src="user?.avatarUrl || ''" size="xl" />
            <div class="flex flex-col text-left">
              <p class="text-muted text-sm font-normal">Created by</p>
              <p class="text-highlighted text-base font-medium">
                {{ user?.username }}
              </p>
            </div>
          </div>
        </UButton>

        <div
          class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
        >
          <UButton
            label="Skip"
            icon="i-heroicons-x-mark"
            size="lg"
            variant="subtle"
            color="error"
            aria-label="Wrong"
            @click.stop="onSkip"
          />

          <span class="text-muted text-sm font-medium"
            >{{ learnIndex + 1 }} / {{ learnCards.length }}</span
          >

          <UButton
            label="Next"
            icon="i-heroicons-check"
            size="lg"
            variant="subtle"
            color="success"
            aria-label="Correct"
            @click.stop="onNext"
          />
        </div>

        <div class="flex place-content-end gap-2">
          <UButton
            class="cursor-pointer"
            color="neutral"
            icon="i-lucide-shuffle"
            variant="ghost"
            @click="shuffleCards"
          />
          <UDropdownMenu :items="items">
            <UButton
              class="cursor-pointer"
              color="neutral"
              icon="i-lucide-settings"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>
  </div>
</template>
