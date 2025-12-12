<script setup lang="ts">
import type {
  DropdownMenuItem,
  FormErrorEvent,
  FormSubmitEvent,
} from '@nuxt/ui';
import { formatDistanceToNowStrict } from 'date-fns';

const toast = useToast();
const router = useRouter();
const { token, data: user } = useAuth();
const store = useDeckStore();

const { isSavingCards, session, progress, handleAnswer } =
  useFlashcardSession();

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 300);

const form = useTemplateRef('form');

const isFlipped = ref(false);
const formErrorMsg = ref('');
const isEditing = ref(false);
const isSavingChanges = ref(false);

const state = reactive<Partial<DeckFormState>>({});

const settingOptions = computed<DropdownMenuItem[][]>(() => [
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
      onUpdateChecked: (checked) => store.updateIgnoreDate(checked),
      onSelect: (e) => e.preventDefault(),
    },
    {
      label: 'Edit deck',
      icon: 'i-lucide-pencil-line',
      disabled: isEditing.value,
      onSelect: startEditing,
    },
  ],
  [
    {
      label: 'Delete deck',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: onDelete,
    },
  ],
]);

const studyOptions = computed(() => [
  {
    label: 'Flashcards',
    icon: 'i-lucide-gallery-horizontal-end',
    to: `/${store.username}/${store.slug}/flashcards?deckId=${store.deckId}`,
  },
  {
    label: 'Learn',
    icon: 'i-lucide-notebook-pen',
    to: `/${store.username}/${store.slug}/learn?deckId=${store.deckId}`,
  },
  {
    label: 'Test',
    icon: 'i-lucide-flask-conical',
    to: `/${store.username}/${store.slug}/test?deckId=${store.deckId}`,
  },
  {
    label: 'Coming soon',
    icon: '',
    to: `#`,
  },
]);

watchImmediate(
  () => store.deck,
  (newDeck) => resetFormState(newDeck),
);

// Update form state when auto-save happens in useDeck
watch(
  () => session.savedCards,
  (newCards) => {
    if (!newCards.length) return;

    const map = new Map(newCards.map((a) => [a.id, a]));

    if (state.cards?.length) {
      for (const c of state.cards) {
        const answer = map.get(c.id);

        if (answer) {
          Object.assign(c, {
            ...answer,
            status: getCardStatus(answer.reviewDate),
          });
        }
      }
    }
  },
);

watch(
  () => session.currentCard,
  () => (isFlipped.value = false),
);

async function onDelete() {
  $fetch(`/api/decks/${store.deckId}`, {
    method: 'DELETE',
    headers: { Authorization: token.value || '' },
  })
    .then(() => router.push(`/home`))
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error deleting deck',
        description: JSON.stringify(error.data?.message || 'Unknown error'),
        color: 'error',
      });
    });
}

async function onSubmit(
  event: FormSubmitEvent<{ name: string; description: string; cards: Card[] }>,
) {
  if (isSavingChanges.value) return;
  isSavingChanges.value = true;

  $fetch(`/api/decks/${store.deckId}`, {
    method: 'PATCH',
    headers: { Authorization: token.value || '' },
    body: event.data,
  })
    .then(async () => {
      isEditing.value = false;
      await store.refetch();

      toast.add({
        title: 'Changes saved successfully.',
        color: 'success',
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error saving changes',
        description: JSON.stringify(error.data?.message || 'Unknown error'),
        color: 'error',
      });

      return;
    })
    .finally(() => {
      formErrorMsg.value = '';
      isSavingChanges.value = false;
    });
}

async function onSubmitError(event: FormErrorEvent) {
  const formError = event.errors.find((e) => e.name === '');

  formErrorMsg.value = formError
    ? formError.message
    : 'Please fill in all required fields.';
}

function startEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  resetFormState(store.deck);
  isEditing.value = false;
  form.value?.clear();
  formErrorMsg.value = '';

  toast.add({
    title: 'Editing canceled successfully.',
    color: 'success',
  });
}

function resetFormState(deck?: DeckWithCards) {
  if (deck) {
    state.name = deck.name;
    state.description = deck.description || '';
    state.cards = structuredClone(deck.cards);
  }
}

function addCardFirst() {
  state.cards?.unshift({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    streak: 0,
    reviewDate: undefined,
    status: 'new',
  });

  toast.add({
    title: 'Added first successfully.',
    color: 'success',
  });
}

function addCardLast() {
  state.cards?.push({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    streak: 0,
    reviewDate: undefined,
    status: 'new',
  });

  toast.add({
    title: 'Added last successfully.',
    color: 'success',
  });
}

function removeCard(cardId?: UUID) {
  state.cards = state.cards?.filter((c) => c.id !== cardId);
}

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
  <SkeletonDeckDetailPage
    v-if="store.status === 'idle' || store.status === 'pending'"
  />

  <UPage v-else>
    <UContainer>
      <UButton
        to="/home"
        class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
        variant="link"
        icon="i-lucide-move-left"
        label="Back to home"
      />

      <UForm
        ref="form"
        :schema="deckSchema"
        :state="state"
        @submit="onSubmit"
        @error="onSubmitError"
      >
        <UPageHeader :ui="{ title: 'flex-1' }" class="py-0 pb-8">
          <div class="mt-4 flex flex-col-reverse gap-4 lg:flex-col">
            <!-- Learning Options -->
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <UButton
                v-for="{ label, icon, to } in studyOptions"
                :key="label"
                :to="to"
                class="hover:ring-primary hover:text-primary hover:bg-primary/10 flex place-content-center place-items-center py-3 transition-all hover:scale-102 hover:shadow"
                variant="subtle"
                color="neutral"
              >
                <UIcon v-if="icon" :name="icon" class="size-5" />

                <h3 class="truncate text-base font-medium sm:text-lg">
                  {{ label }}
                </h3>
              </UButton>
            </div>

            <!-- Flashcard Study -->
            <div v-if="session.currentCard" class="flex w-full flex-col gap-2">
              <!-- Status bar -->
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
                <div
                  class="flex w-full place-content-between place-items-center"
                >
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

                <div
                  class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl"
                >
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
                <div class="col-span-1">
                  <UButton
                    :to="`/${store.username}`"
                    variant="link"
                    color="neutral"
                    class="w-fit p-0"
                  >
                    <div class="flex place-items-center gap-2">
                      <UAvatar :src="user?.avatarUrl || ''" size="xl" />

                      <div class="flex flex-col">
                        <p class="text-muted text-sm font-normal text-pretty">
                          Created by
                        </p>

                        <p class="text-highlighted text-base font-medium">
                          {{ store.username }}
                        </p>
                      </div>
                    </div>
                  </UButton>
                </div>

                <div
                  class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
                >
                  <UTooltip
                    :delay-duration="200"
                    :kbds="['arrowleft']"
                    text="Skip this card"
                  >
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

                  <UTooltip
                    :delay-duration="200"
                    :kbds="['arrowright']"
                    text="Next card"
                  >
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
                    class="cursor-pointer"
                    color="neutral"
                    icon="i-lucide-shuffle"
                    variant="ghost"
                    size="lg"
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
          </div>

          <!-- Title and Description -->
          <template #title>
            <UFormField name="name">
              <UInput
                v-model="state.name"
                :disabled="!isEditing"
                :ui="{
                  base: `${!isEditing ? 'p-0' : ''} text-highlighted text-lg font-semibold text-pretty sm:text-xl disabled:opacity-100 disabled:cursor-default`,
                }"
                :variant="isEditing ? 'subtle' : 'ghost'"
                class="w-full"
                autoresize
              />
            </UFormField>

            <UFormField
              :class="`${isEditing ? 'mt-3' : ''}`"
              name="description"
            >
              <UTextarea
                v-model="state.description"
                :rows="1"
                :maxrows="10"
                :disabled="!isEditing"
                :ui="{
                  base: `${!isEditing ? 'p-0' : ''} text-muted text-base font-normal text-pretty disabled:opacity-100 disabled:cursor-default`,
                }"
                :variant="isEditing ? 'subtle' : 'ghost'"
                class="w-full"
                autoresize
              />
            </UFormField>
          </template>
        </UPageHeader>

        <UPageBody class="mt-4">
          <div class="flex flex-col gap-4">
            <div
              class="grid place-content-between place-items-center gap-4 sm:flex"
            >
              <h2
                class="flex place-items-center gap-1 text-lg font-medium sm:text-xl"
              >
                Terms ({{ state.cards?.length || 0 }})

                <span v-if="!isEditing" class="inline-flex">
                  <UIcon
                    v-if="!isSavingCards"
                    class="text-success size-6"
                    name="i-lucide-check"
                  />

                  <span
                    v-else
                    class="ml-2 place-self-end-safe text-base font-normal text-current/75 sm:text-lg"
                  >
                    Saving...
                  </span>
                </span>
              </h2>

              <div v-if="isEditing" class="flex gap-2 place-self-end">
                <UButton
                  class="cursor-pointer"
                  label="Cancel"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="outline"
                  :disabled="isSavingChanges"
                  @click="cancelEditing"
                />

                <UButton
                  :loading="isSavingChanges"
                  :label="isSavingChanges ? 'Saving...' : 'Save Changes'"
                  class="cursor-pointer"
                  icon="i-lucide-save"
                  loading-icon="i-lucide-loader-circle"
                  type="submit"
                />
              </div>
            </div>

            <UAlert
              v-if="formErrorMsg"
              icon="i-lucide-alert-triangle"
              color="error"
              variant="soft"
              title="Validation Error"
              :description="formErrorMsg"
            />

            <UButton
              v-if="isEditing"
              :disabled="isSavingChanges"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardFirst"
            />

            <TransitionGroup name="list" appear>
              <UCard
                v-for="(c, index) in state.cards"
                :key="c.id"
                :ui="{ body: `${!isEditing ? 'px-2 sm:px-4' : ''}` }"
                class="bg-elevated"
                variant="subtle"
              >
                <div
                  :class="`mb-1 flex place-content-between place-items-center gap-2 ${isEditing ? 'px-0' : 'px-2.5'}`"
                >
                  <CardStatusBadge :card="c" />

                  <UButton
                    v-if="isEditing"
                    class="cursor-pointer"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="removeCard(c.id)"
                  />

                  <span
                    v-else-if="
                      !isEditing && c.reviewDate && c.status === 'known'
                    "
                    class="text-muted text-right text-sm text-balance"
                  >
                    Next review

                    {{
                      formatDistanceToNowStrict(c.reviewDate, {
                        addSuffix: true,
                        unit: 'day',
                        roundingMethod: 'ceil',
                      })
                    }}
                  </span>
                </div>

                <div class="flex flex-col sm:flex-row">
                  <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                    <UTextarea
                      v-model="c.term"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>

                  <USeparator class="m-2 sm:hidden" />

                  <USeparator
                    orientation="vertical"
                    class="m-2 hidden h-auto sm:block"
                  />

                  <UFormField
                    class="sm:flex-1"
                    :name="`cards.${index}.definition`"
                  >
                    <UTextarea
                      v-model="c.definition"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-base sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>
                </div>
              </UCard>
            </TransitionGroup>

            <UButton
              v-if="isEditing"
              :disabled="isSavingChanges"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardLast"
            />

            <div v-if="isEditing" class="flex gap-2 place-self-end">
              <UButton
                class="cursor-pointer"
                label="Cancel"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                :disabled="isSavingChanges"
                @click="cancelEditing"
              />

              <UButton
                :loading="isSavingChanges"
                :label="isSavingChanges ? 'Saving...' : 'Save Changes'"
                class="cursor-pointer"
                color="primary"
                icon="i-lucide-save"
                loading-icon="i-lucide-loader-circle"
                type="submit"
              />
            </div>
          </div>
        </UPageBody>
      </UForm>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
