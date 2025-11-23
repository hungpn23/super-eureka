<script setup lang="ts">
import type {
  DropdownMenuItem,
  FormErrorEvent,
  FormSubmitEvent,
} from '@nuxt/ui';
import { CardStatus } from '~/utils/enums';
import { formatDistanceToNowStrict } from 'date-fns';
import { DeckWithCardsSchema } from '~~/shared/types/deck';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const { token, data: user } = useAuth();

const formErrorMsg = ref('');
const isEditing = ref(false);
const isSaving = ref(false);
const cards = ref<Card[]>([]);
const form = useTemplateRef('form');
const deckState = reactive<Partial<DeckWithCards>>({});

const deckId = computed(() => route.query.deckId as string);

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const username = computed(() => {
  const n = route.params.username;

  return Array.isArray(n) ? n[0] : n;
});

const DeckSettingOptions = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil-line',
      disabled: isEditing.value,
      onSelect: startEditing,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: onDeckDelete,
    },
  ],
]);

const StudyOptions = computed(() => [
  {
    label: 'Flashcards',
    icon: 'i-lucide-file-plus',
    to: `/${user.value?.username}/${deckSlug.value}/flashcards?deckId=${deckId.value}`,
  },
  {
    label: 'Learn',
    icon: 'i-lucide-book-marked',
    to: `/${user.value?.username}/${deckSlug.value}/learn?deckId=${deckId.value}`,
  },
  {
    label: 'Test',
    icon: 'i-lucide-book-check',
    to: `/${user.value?.username}/${deckSlug.value}/test?deckId=${deckId.value}`,
  },
  {
    label: 'Comming soon',
    icon: '',
    to: `#`,
  },
]);

const {
  data: deck,
  error,
  status,
  refresh: refreshData,
} = await useLazyFetch<DeckWithCards, ErrorResponse>(
  `/api/decks/${deckId.value}`,
  {
    headers: {
      Authorization: token.value || '',
    },
    server: false,
  },
);

watch(
  status,
  (newStatus) => {
    if (newStatus === 'error') {
      toast.add({
        title: 'Error fetching decks',
        description: JSON.stringify(error.value?.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    }
  },
  { immediate: true },
);

watch(
  deck,
  (newDeck) => {
    resetFormState(newDeck);
    cards.value = getCards(false);
  },
  {
    immediate: true,
  },
);

async function onDeckDelete() {
  $fetch(`/api/decks/${deckId.value}`, {
    method: 'DELETE',
    headers: {
      Authorization: token.value || '',
    },
  })
    .then(() => {
      router.push(`/home`);
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error deleting deck',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    });
}

async function onSubmit(event: FormSubmitEvent<DeckWithCards>) {
  if (isSaving.value) return;
  isSaving.value = true;

  $fetch(`/api/decks/${deckId.value}`, {
    method: 'PATCH',
    headers: {
      Authorization: token.value || '',
    },
    body: event.data,
  })
    .then(async () => {
      isEditing.value = false;
      await refreshData();

      toast.add({
        title: 'Changes saved successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error saving changes',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });

      return;
    })
    .finally(() => {
      formErrorMsg.value = '';
      isSaving.value = false;
    });
}

async function onError(event: FormErrorEvent) {
  const formError = event.errors.find((e) => e.name === '');

  formErrorMsg.value = formError
    ? formError.message
    : 'Please fill in all required fields.';
}

async function onIgnoreDate() {
  await refreshData();

  cards.value = getCards(true);
}

function onAnswersSaved(answers: CardAnswer[]) {
  const map = new Map(answers.map((a) => [a.id, a]));

  if (deckState.cards?.length) {
    for (const c of deckState.cards) {
      const answer = map.get(c.id);

      if (answer) {
        Object.assign(c, {
          ...answer,
          status: calcCardStatus(answer.reviewDate),
        });
      }
    }
  }
}

function startEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  resetFormState(deck.value);
  isEditing.value = false;
  form.value?.clear();
  formErrorMsg.value = '';

  toast.add({
    title: 'Editing canceled successfully.',
    color: 'success',
    duration: 2000,
  });
}

function resetFormState(newRes?: DeckWithCards) {
  if (newRes) {
    deckState.name = newRes.name;
    deckState.description = newRes.description || '';
    deckState.cards = structuredClone(newRes.cards);
  }
}

function addCardFirst() {
  deckState.cards?.unshift({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    streak: 0,
    reviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added first successfully.',
    color: 'success',
    duration: 2000,
  });
}

function addCardLast() {
  deckState.cards?.push({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    streak: 0,
    reviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added last successfully.',
    color: 'success',
    duration: 2000,
  });
}

function deleteCard(cardId?: UUID) {
  deckState.cards = deckState.cards?.filter((c) => c.id !== cardId);
}

function getCards(ignoreDate: boolean) {
  if (!deck.value) return [];

  return ignoreDate
    ? deck.value.cards
    : deck.value.cards.filter(
        (c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
      );
}
</script>

<template>
  <SkeletonDeckDetailPage v-if="status === 'pending' || status === 'idle'" />

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
        :schema="DeckWithCardsSchema"
        :state="deckState"
        ref="form"
        @submit="onSubmit"
        @error="onError"
      >
        <UPageHeader :ui="{ title: 'flex-1' }" class="py-0 pb-8">
          <div class="mt-4 flex flex-col-reverse gap-4 lg:flex-col">
            <!-- Learning Options -->
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <UButton
                v-for="{ label, icon, to } in StudyOptions"
                :key="label"
                :to="to"
                class="hover:ring-primary hover:text-primary hover:bg-primary/10 flex place-content-center place-items-center py-3 transition-all hover:scale-102 hover:shadow"
                variant="subtle"
                color="neutral"
              >
                <UIcon v-if="icon" :name="icon" class="size-5" />

                <h3 class="truncate text-lg font-medium">{{ label }}</h3>
              </UButton>
            </div>

            <!-- Flashcard Study -->
            <Flashcard
              :username
              :cards
              :deck="{ id: deckId, slug: deckSlug }"
              @answers-saved="onAnswersSaved"
              @restarted="refreshData"
              @ignore-date="onIgnoreDate"
            >
              <template #actions-left>
                <UButton
                  :to="`/${username}`"
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
                        {{ username }}
                      </p>
                    </div>
                  </div>
                </UButton>
              </template>

              <template #actions-right>
                <div class="flex place-content-end place-items-center gap-2">
                  <UButton
                    class="cursor-pointer"
                    color="neutral"
                    icon="i-lucide-shuffle"
                    variant="ghost"
                    size="lg"
                  />

                  <UDropdownMenu :items="DeckSettingOptions">
                    <UButton
                      class="cursor-pointer"
                      color="neutral"
                      icon="i-lucide-settings"
                      variant="ghost"
                      size="lg"
                    />
                  </UDropdownMenu>
                </div>
              </template>
            </Flashcard>
          </div>

          <!-- Title and Description -->
          <template #title>
            <UFormField name="name">
              <UInput
                v-model="deckState.name"
                :disabled="!isEditing"
                :ui="{
                  base: `${!isEditing ? 'p-0' : ''} text-highlighted text-2xl font-bold text-pretty sm:text-3xl disabled:opacity-100 disabled:cursor-default`,
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
                v-model="deckState.description"
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
            <div class="flex place-content-between place-items-center gap-4">
              <h2
                class="flex place-items-center gap-1 text-xl font-bold text-pretty sm:text-2xl"
              >
                Terms ({{ deckState.cards?.length || 0 }})

                <!-- <UIcon
                  v-if="!savingAnswers"
                  class="text-success size-6"
                  name="i-lucide-check"
                />

                <span
                  v-else
                  class="ml-2 place-self-end-safe text-base font-normal text-current/75 sm:text-lg"
                >
                  Saving...
                </span> -->
              </h2>

              <div v-if="isEditing" class="flex gap-2 place-self-end">
                <UButton
                  class="cursor-pointer"
                  label="Cancel"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="outline"
                  :disabled="isSaving"
                  @click="cancelEditing"
                />

                <UButton
                  :loading="isSaving"
                  :label="isSaving ? 'Saving...' : 'Save Changes'"
                  class="cursor-pointer"
                  color="primary"
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
              :disabled="isSaving"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardFirst"
            />

            <TransitionGroup name="list" appear>
              <UCard
                v-for="(c, index) in deckState.cards"
                :key="c.id"
                variant="subtle"
              >
                <div
                  :class="`mb-1 flex place-content-between place-items-center gap-2 ${isEditing ? 'px-0' : 'px-2.5'}`"
                >
                  <UBadge
                    :label="c.status"
                    :color="
                      {
                        known: 'success' as const,
                        learning: 'warning' as const,
                        new: 'info' as const,
                      }[c.status]
                    "
                    class="capitalize"
                    variant="subtle"
                  />

                  <UButton
                    v-if="isEditing"
                    class="cursor-pointer"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="deleteCard(c.id)"
                  />

                  <span
                    v-else-if="
                      !isEditing &&
                      c.reviewDate &&
                      c.status === CardStatus.KNOWN
                    "
                    class="text-right text-sm text-balance"
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
                        base: 'text-lg sm:text-xl disabled:opacity-100 disabled:cursor-default',
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
                        base: 'text-lg sm:text-xl disabled:opacity-100 disabled:cursor-default',
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
              :disabled="isSaving"
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
                :disabled="isSaving"
                @click="cancelEditing"
              />

              <UButton
                :loading="isSaving"
                :label="isSaving ? 'Saving...' : 'Save Changes'"
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
