<script setup lang="ts">
import type { UCard } from '#components';
import { breakpointsTailwind } from '@vueuse/core';
import type { TestSetting } from '~~/shared/types/card';

const { token } = useAuth();
const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');
const cardRefs = useTemplateRef('cards');

const isSettingOpen = ref(false);
const isSubmitted = ref(false);
const questions = ref<TestQuestion[]>([]);

const setting = reactive<TestSetting>({
  questionAmount: 0,
  types: ['multiple_choices'],
  direction: 'term_to_def',
});
let snapshotSetting = '';

const session = reactive({
  index: 0,
  input: null as HTMLInputElement | null,
  get element() {
    if (!cardRefs.value) return undefined;

    return cardRefs.value[this.index]?.$el as Element | undefined;
  },
});

const deckId = computed(() => route.query.deckId as string);

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const username = computed(() => {
  const n = route.params.username;

  return Array.isArray(n) ? n[0] : n;
});

const {
  data: deck,
  pending,
  refresh,
} = await useLazyFetch<DeckWithCards>(`/api/decks/${deckId.value}`, {
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(deck, (newDeck) => {
  if (newDeck && newDeck.cards.length > 0) {
    session.input = null;
    session.index = 0;
    isSubmitted.value = false;

    if (
      !setting.questionAmount ||
      setting.questionAmount > newDeck.cards.length
    )
      setting.questionAmount = newDeck.cards.length;

    questions.value = generateQuestions<TestQuestion>({
      cards: shuffle(newDeck.cards).slice(0, setting.questionAmount),
      types: setting.types,
      dir: setting.direction,
      answerPool: newDeck.cards.map((c) => ({
        id: c.id,
        term: c.term,
        definition: c.definition,
      })),
    });
  }
});

watch(() => session.index, scrollAndFocus);
watch(
  () => setting.types,
  () => {
    if (!setting.types.length) setting.types = ['multiple_choices'];
  },
);

function scrollAndFocus() {
  if (session.element) {
    session.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    if (session.input) session.input.blur();

    const newInput = session.element.querySelector('input');
    if (newInput) {
      session.input = newInput;
      setTimeout(() => newInput.focus(), 300);
    } else {
      session.input = null;
    }
  }
}

function handleChangeQuestion(dir: 'left' | 'right') {
  if (!cardRefs.value || !cardRefs.value.length) return;

  if (dir === 'left' && session.index > 0) {
    session.index--;
  } else if (dir === 'right' && session.index < cardRefs.value.length - 1) {
    session.index++;
  }
}

async function onSettingClosed() {
  if (JSON.stringify(setting) === snapshotSetting) {
    scrollAndFocus();
    return;
  }

  snapshotSetting = '';
  await refresh();
  scrollAndFocus();
}

// --- [MỚI] Các hàm xử lý logic câu hỏi ---

// 1. Xử lý khi chọn trắc nghiệm
function onSelectChoice(q: TestQuestion, qIndex: number, cIndex: number) {
  // Cập nhật index người dùng chọn
  q.userChoiceIndex = cIndex;

  // Tính toán đúng/sai ngay lập tức (theo logic cũ của bạn)
  q.isCorrectChoice = cIndex === q.correctChoiceIndex;

  // Cập nhật session và chuyển câu
  session.index = qIndex;
  handleChangeQuestion('right');

  console.log(`Q${qIndex}: Correct? ${q.isCorrectChoice}`);
}

// 2. Xử lý khi nhập xong câu tự luận (Blur)
function onWrittenAnswerBlur(q: TestQuestion) {
  if (q.userAnswer) {
    // Trim khoảng trắng thừa
    q.userAnswer = q.userAnswer.trim();

    // So sánh cơ bản (case-insensitive) để tính isCorrect
    // Lưu ý: Logic so sánh thực tế có thể phức tạp hơn
    q.isCorrectChoice = q.userAnswer.toLowerCase() === q.answer.toLowerCase();

    console.log('User answer cleaned:', q.userAnswer);
    console.log('Is correct?', q.isCorrectChoice);
  }
}

function onSubmitTest() {
  isSubmitted.value = true;
}

function getChoiceBtnClass(q: TestQuestion, cIndex: number) {
  const isSelected = q.userChoiceIndex === cIndex;
  const isThisChoiceCorrect = q.correctChoiceIndex === cIndex;

  if (!isSubmitted.value) {
    if (isSelected) {
      return 'border-primary bg-primary/10 text-primary';
    }

    return '';
  }

  if (isSelected) {
    if (isThisChoiceCorrect) {
      return 'border-success bg-success/10 text-success';
    }

    return 'border-error bg-error/10 text-error';
  } else {
    if (isThisChoiceCorrect) {
      return 'border-dashed border-success bg-success/10 text-success';
    }

    return 'opacity-60';
  }
}

defineShortcuts({
  '1': () => console.log('triggered shortcut 0 !!!'),
  '2': () => console.log('triggered shortcut 1 !!!'),
  '3': () => console.log('triggered shortcut 2 !!!'),
  '4': () => console.log('triggered shortcut 3 !!!'),

  arrowleft: {
    handler: () => handleChangeQuestion('left'),
    usingInput: true,
  },

  arrowright: {
    handler: () => handleChangeQuestion('right'),
    usingInput: true,
  },
});

onMounted(() => {
  isSettingOpen.value = true;
});
</script>

<template>
  <ClientOnly>
    <UContainer>
      <div class="flex place-content-between place-items-center gap-2">
        <UButton
          :to="`/${username}/${deckSlug}?deckId=${deckId}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          icon="i-lucide-move-left"
          label="Back to Home"
        />

        <!-- Right actions -->
        <div class="flex place-items-center place-self-end">
          <KeyboardShortcuts />

          <UModal
            v-model:open="isSettingOpen"
            :fullscreen="!smAndLarger"
            :ui="{
              content: 'divide-none',
              body: 'flex-initial pt-0 sm:pt-0',
              footer: 'place-content-end',
            }"
            description="Let's customize your test"
            @after:enter="snapshotSetting = JSON.stringify(setting)"
            @after:leave="onSettingClosed"
          >
            <UButton
              class="cursor-pointer place-self-end"
              icon="i-lucide-settings"
              variant="ghost"
              color="neutral"
              size="lg"
              @click="isSettingOpen = true"
            />

            <template #title>
              <span class="text-xl font-semibold sm:text-2xl">
                Test settings
              </span>
            </template>

            <template #body>
              <div class="flex flex-col gap-2 font-semibold">
                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Number of questions</div>

                  <UInput
                    v-model.number="setting.questionAmount"
                    type="number"
                    size="lg"
                  />
                </div>

                <USeparator label="Answer format" />

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Question types</div>

                  <USelect
                    v-model="setting.types"
                    :items="questionTypeItems"
                    :ui="{ content: 'min-w-fit' }"
                    size="lg"
                    value-key="value"
                    multiple
                  />
                </div>

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Answer with</div>

                  <USelect
                    v-model="setting.direction"
                    :items="questionDirectionItems"
                    :ui="{ content: 'min-w-fit' }"
                    size="lg"
                  />
                </div>
              </div>
            </template>

            <template #footer>
              <UButton
                class="cursor-pointer"
                label="Apply"
                color="neutral"
                size="lg"
                @click="isSettingOpen = false"
              />
            </template>
          </UModal>
        </div>
      </div>

      <div v-if="pending" class="flex justify-center p-10">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
      </div>

      <div v-else-if="questions.length" class="mb-8 flex w-full flex-col gap-2">
        <h1
          class="mb-2 flex place-items-center place-self-center text-lg font-semibold sm:text-xl"
        >
          {{ deck?.name || '' }}
        </h1>

        <UCard
          v-for="(q, qIndex) in questions"
          :key="qIndex"
          ref="cards"
          :ui="{
            header: 'p-0 sm:px-0',
            body: `flex-1 w-full flex flex-col gap-4 sm:gap-4 p-2`,
          }"
          class="bg-elevated mb-2 flex min-h-[30dvh] flex-col divide-none shadow-md transition-all sm:mb-4"
          @click="session.index = qIndex"
        >
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-semibold">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
                tabindex="-1"
              />
              Term
            </span>

            <UBadge
              :label="`${qIndex + 1} of ${questions.length}`"
              variant="subtle"
              color="neutral"
            />
          </div>

          <div class="text-xl font-medium sm:text-2xl">
            {{ q.question }}
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <span class="font-bold">
              {{
                q.type === 'multiple_choices'
                  ? 'Choose an answer'
                  : 'Type your answer'
              }}
            </span>

            <!-- Multiple Choices Answer -->
            <div
              v-if="q.type === 'multiple_choices'"
              class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
            >
              <button
                v-for="(choice, cIndex) in q.choices"
                :key="cIndex"
                :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none ${getChoiceBtnClass(q, cIndex)}`"
                :disabled="isSubmitted"
                @click.stop="onSelectChoice(q, qIndex, cIndex)"
              >
                <UBadge
                  class="hidden h-8 w-8 shrink-0 place-content-center place-items-center rounded-full border border-inherit font-bold text-inherit ring-0 transition-all sm:flex"
                  variant="outline"
                >
                  {{ cIndex + 1 }}
                </UBadge>

                <span class="text-start text-base font-medium sm:text-lg">
                  {{ choice }}
                </span>
              </button>
            </div>

            <!-- Written Answer -->
            <div v-else class="flex w-full flex-col gap-2">
              <UInput
                v-model="q.userAnswer"
                :ui="{
                  base: `text-lg sm:text-xl transition-all`,
                }"
                variant="outline"
                color="neutral"
                @keydown.enter="handleChangeQuestion('right')"
                @blur="onWrittenAnswerBlur(q)"
                @click.stop="session.index = qIndex"
              />

              <UInput
                v-if="q.isCorrectChoice === false"
                :ui="{
                  base: `text-lg sm:text-xl transition-all ring-2 ring-success disabled:opacity-100 disabled:cursor-not-allowed`,
                }"
                :default-value="q.answer"
                disabled
              />
            </div>

            <div class="flex place-content-end place-items-center gap-2">
              <UButton
                class="cursor-pointer place-self-end font-medium"
                variant="ghost"
                tabindex="-1"
              >
                Don't know?
              </UButton>

              <UButton
                v-if="q.type === 'written'"
                :disabled="!q.userAnswer"
                class="cursor-pointer font-medium"
                @click="console.log('submitted answer', q.userAnswer)"
              >
                Answer
              </UButton>
            </div>
          </div>
        </UCard>

        <UButton
          block
          size="xl"
          color="primary"
          variant="solid"
          class="cursor-pointer font-bold shadow-lg transition-transform active:scale-[0.99]"
          label="Submit Test"
          icon="i-lucide-send-horizontal"
          @click="onSubmitTest"
        />
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
            onClick: () => console.log('restart test'),
          },
          {
            icon: 'i-lucide-fast-forward',
            label: 'Ignore & continue',
            color: 'neutral',
            variant: 'subtle',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: () => console.log('ignore and continue'),
          },
        ]"
        variant="naked"
        icon="i-lucide-party-popper"
        title="You're all caught up — nothing to review now."
        description="Optimize your retention by strictly adhering to the next review date."
        size="xl"
      />
    </UContainer>
  </ClientOnly>
</template>
