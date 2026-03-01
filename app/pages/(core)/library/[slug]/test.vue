<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import type { UCard } from "#components";
import type { TestQuestion, TestSession, TestSetting } from "~/features/card";
import {
	generateQuestions,
	QUESTION_DIRECTION_ITEMS,
	QUESTION_TYPE_ITEMS,
	shuffleArray,
} from "~/features/deck";
import { focusInput, getCards } from "~/shared/utils";

const smAndLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("sm");
const store = useDeckStore();
const cardRefs = useTemplateRef("cards");

const throttledOnChoiceSelected = useThrottleFn(onChoiceSelected, 300);

const isSettingOpen = ref(false);

const setting = reactive<TestSetting>({
	questionAmount: 0,
	isIgnoreDate: true,
	types: ["multiple_choices", "written"],
	direction: "term_to_def",
});
let snapshotSetting = "";

const session = reactive<TestSession>({
	index: 0,
	isSubmitted: false,
	questions: [],
	currentQuestion: undefined,
	input: null,
	element: null,
});

watch([() => session.questions, () => session.index], () => {
	session.currentQuestion = session.questions[session.index];
});

watch([cardRefs, () => session.index], () => {
	if (cardRefs.value?.length) {
		session.element = cardRefs.value[session.index]?.$el as Element;
	}
});

watch(
	[
		() => store.deck?.cards,
		() => setting.isIgnoreDate,
		() => setting.questionAmount,
	],
	([newCards, newIsIgnoreDate]) => {
		if (newCards && newCards.length > 0) {
			session.input = null;
			session.index = 0;
			session.isSubmitted = false;

			const filteredCards = getCards(newCards, newIsIgnoreDate);

			if (
				setting.questionAmount === 0 ||
				setting.questionAmount > filteredCards.length
			) {
				setting.questionAmount = filteredCards.length;
			}

			session.questions = generateQuestions<TestQuestion>({
				cards: shuffleArray(newCards).slice(0, setting.questionAmount),
				types: setting.types,
				dir: setting.direction,
				answerPool: newCards,
			});
		}
	},
);

watch(() => session.index, scrollAndFocus);

watch(
	() => setting.types,
	() => {
		if (!setting.types.length) setting.types = ["multiple_choices"];
	},
);

function scrollAndFocus() {
	if (session.element) {
		session.element.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		if (session.input) session.input.blur();

		const newInput = session.element.querySelector("input");
		if (newInput) {
			session.input = newInput;
			return focusInput(newInput);
		}

		session.input = null;
	}
}

function handleChangeQuestion(dir: "left" | "right") {
	if (!cardRefs.value || !cardRefs.value.length) return;

	if (dir === "left" && session.index > 0) {
		session.index--;
	} else if (dir === "right" && session.index < cardRefs.value.length - 1) {
		session.index++;
	}
}

async function onSettingClosed() {
	if (JSON.stringify(setting) === snapshotSetting) {
		scrollAndFocus();
		return;
	}

	snapshotSetting = "";
	await store.refetchDeckDetail();
	scrollAndFocus();
}

function onChoiceSelected(cIndex: number, qIndex: number, q?: TestQuestion) {
	if (!q) return;

	q.userChoiceIndex = cIndex;
	q.isUserAnswerCorrect = cIndex === q.correctChoiceIndex;
	session.index = qIndex;
	handleChangeQuestion("right");
}

function onWrittenAnswerBlur(q: TestQuestion) {
	if (!q.userAnswer) return;

	q.userAnswer = q.userAnswer.trim();
	q.isUserAnswerCorrect =
		q.userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
}

function onDontKnowClicked(q: TestQuestion, qIndex: number) {
	if (q.isMarkedAsDontKnow) return;

	q.isMarkedAsDontKnow = true;
	q.isUserAnswerCorrect = true;
	session.index = qIndex;
	handleChangeQuestion("right");
}

function onTestSubmitted() {
	session.isSubmitted = true;
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function getChoiceBtnClass(q: TestQuestion, cIndex: number) {
	const isSelected = q.userChoiceIndex === cIndex;
	const isThisChoiceCorrect = q.correctChoiceIndex === cIndex;

	if (!session.isSubmitted) {
		if (isSelected) {
			return "border-primary bg-primary/10 text-primary";
		}

		return "";
	}

	if (isSelected) {
		if (isThisChoiceCorrect) {
			return "border-success bg-success/10 text-success";
		}

		return "border-error bg-error/10 text-error";
	} else {
		if (isThisChoiceCorrect) {
			return "border-dashed border-success bg-success/10 text-success";
		}

		return "opacity-70";
	}
}

function getWrittenInputClass(q: TestQuestion) {
	if (!session.isSubmitted) return "";

	if (q.isUserAnswerCorrect) {
		return "border-success";
	}

	return "border-error";
}

defineShortcuts({
	"1": () =>
		throttledOnChoiceSelected(0, session.index, session.currentQuestion),
	"2": () =>
		throttledOnChoiceSelected(1, session.index, session.currentQuestion),
	"3": () =>
		throttledOnChoiceSelected(2, session.index, session.currentQuestion),
	"4": () =>
		throttledOnChoiceSelected(3, session.index, session.currentQuestion),

	arrowleft: {
		handler: () => handleChangeQuestion("left"),
		usingInput: true,
	},

	arrowright: {
		handler: () => handleChangeQuestion("right"),
		usingInput: true,
	},
});

onMounted(() => {
	isSettingOpen.value = true;
});
</script>

<template>
  <SkeletonTestPage v-if="store.isFetchingDeck" />

  <UContainer v-else>
    <div class="flex place-content-between place-items-center gap-2">
      <UButton
        :to="`/library/${store.slug}?deckId=${store.deckId}`"
        class="mt-2 cursor-pointer px-0 text-base"
        variant="link"
        icon="i-lucide-move-left"
        label="Back to Home"
      />

      <div class="flex place-items-center place-self-end">
        <UButton
          class="cursor-pointer place-self-end"
          icon="i-lucide-settings"
          variant="ghost"
          color="neutral"
          size="lg"
          @click="isSettingOpen = true"
        />
      </div>
    </div>

    <div v-if="session.questions.length" class="flex w-full flex-col gap-4">
      <h1
        class="mb-2 max-w-5/6 place-self-center truncate text-lg font-semibold sm:text-xl"
      >
        {{ store.deck?.name }}
      </h1>

      <UCard
        v-for="(q, qIndex) in session.questions"
        :key="qIndex"
        ref="cards"
        :ui="{
          header: 'p-0 sm:px-0',
          body: `flex-1 w-full flex flex-col gap-4 p-2`,
        }"
        class="bg-elevated mb-2 flex min-h-[30dvh] flex-col divide-none shadow-md transition-all sm:mb-4"
        @click="session.index = qIndex"
      >
        <div class="flex w-full place-content-between place-items-center">
          <span class="flex place-items-center gap-1">
            <UButton
              class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
              icon="i-lucide-volume-2"
              variant="soft"
              color="neutral"
              tabindex="-1"
            />

            {{
              setting.direction === 'term_to_def'
                ? `Term (${q.termLanguage})`
                : `Definition (${q.definitionLanguage})`
            }}
          </span>

          <UBadge
            :label="`${qIndex + 1} of ${session.questions.length}`"
            variant="soft"
            color="neutral"
          />
        </div>

        <p class="text-xl font-medium sm:text-2xl">
          {{ q.question }}
        </p>

        <div class="mt-2 flex w-full flex-col gap-2">
          <em class="text-sm font-medium">
            {{
              q.type === 'multiple_choices'
                ? 'Choose an answer'
                : 'Type your answer'
            }}
          </em>

          <!-- Multiple Choices Answer -->
          <div
            v-if="q.type === 'multiple_choices'"
            class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
          >
            <button
              v-for="(choice, cIndex) in q.choices"
              :key="cIndex"
              :class="`border-accented bg-default hover:text-primary hover:border-primary hover:bg-primary/25 flex cursor-pointer place-items-center gap-2 rounded-md border-2 p-3 transition-all hover:shadow-lg active:scale-98 disabled:pointer-events-none disabled:opacity-70 ${getChoiceBtnClass(q, cIndex)}`"
              :disabled="session.isSubmitted || q.isMarkedAsDontKnow"
              @click.stop="throttledOnChoiceSelected(cIndex, qIndex, q)"
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
                base: `text-lg sm:text-xl transition-all border-2 border-default ring-0 ring-transparent disabled:opacity-70 ${getWrittenInputClass(q)}`,
              }"
              :disabled="session.isSubmitted || q.isMarkedAsDontKnow"
              variant="outline"
              color="neutral"
              @keydown.enter="handleChangeQuestion('right')"
              @blur="onWrittenAnswerBlur(q)"
              @click.stop="session.index = qIndex"
            />

            <UInput
              v-if="!q.isUserAnswerCorrect && session.isSubmitted"
              :ui="{
                base: `text-lg sm:text-xl transition-all border-2 border-dashed border-success ring-0`,
              }"
              :default-value="q.correctAnswer"
              disabled
            />
          </div>

          <UButton
            v-if="!q.isMarkedAsDontKnow"
            class="cursor-pointer place-self-end font-medium"
            variant="ghost"
            tabindex="-1"
            @click.stop="onDontKnowClicked(q, qIndex)"
          >
            Mark as "Don't know"
          </UButton>
        </div>
      </UCard>

      <UButton
        v-if="!session.isSubmitted"
        class="hover:bg-primary w-fit cursor-pointer place-self-center font-normal transition-all hover:scale-103 active:scale-98"
        label="Submit Test"
        icon="i-lucide-send-horizontal"
        size="xl"
        @click="onTestSubmitted"
      />
    </div>

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
      <template #title>
        <span class="text-xl font-semibold sm:text-2xl"> Test settings </span>
      </template>

      <template #body>
        <div class="flex flex-col gap-2 font-medium">
          <div class="flex place-content-between place-items-center gap-2">
            <div>Number of questions</div>

            <UInput
              v-model.number="setting.questionAmount"
              type="number"
              size="lg"
            />
          </div>

          <div class="flex place-content-between place-items-center gap-2">
            <div>Test all questions</div>

            <USwitch v-model="setting.isIgnoreDate" />
          </div>

          <USeparator label="Answer format" />

          <div class="flex place-content-between place-items-center gap-2">
            <div>Question types</div>

            <USelect
              v-model="setting.types"
              :items="QUESTION_TYPE_ITEMS"
              :ui="{ content: 'min-w-fit' }"
              size="lg"
              value-key="value"
              multiple
            />
          </div>

          <div class="flex place-content-between place-items-center gap-2">
            <div>Answer with</div>

            <USelect
              v-model="setting.direction"
              :items="QUESTION_DIRECTION_ITEMS"
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
  </UContainer>
</template>
