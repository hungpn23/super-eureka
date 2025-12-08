<script setup lang="ts">
import type {
  DropdownMenuItem,
  FormErrorEvent,
  FormSubmitEvent,
} from '@nuxt/ui';
import { formatDistanceToNowStrict } from 'date-fns';
import { deckSchema } from '~~/shared/types/deck';

const toast = useToast();
const router = useRouter();
const { token, data: user } = useAuth();

const form = useTemplateRef('form');

const {
  deck,
  isFetching,
  refresh,
  cards,
  deckId,
  deckSlug,
  username,
  onIgnoreDate,
  onRestarted,
} = useDeck();

const formErrorMsg = ref('');
const isEditing = ref(false);
const isSaving = ref(false);
const isAnswersSaving = ref(false);

const state = reactive<Partial<DeckFormState>>({});

const deckSettingOptions = computed<DropdownMenuItem[][]>(() => [
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

const studyOptions = computed(() => [
  {
    label: 'Flashcards',
    icon: 'i-lucide-gallery-horizontal-end',
    to: `/${username.value}/${deckSlug.value}/flashcards?deckId=${deckId.value}`,
  },
  {
    label: 'Learn',
    icon: 'i-lucide-notebook-pen',
    to: `/${username.value}/${deckSlug.value}/learn?deckId=${deckId.value}`,
  },
  {
    label: 'Test',
    icon: 'i-lucide-flask-conical',
    to: `/${username.value}/${deckSlug.value}/test?deckId=${deckId.value}`,
  },
  {
    label: 'Coming soon',
    icon: '',
    to: `#`,
  },
]);

watchImmediate(deck, (newDeck) => {
  resetFormState(newDeck);
});

function onAnswersSaved(answers: Answer[]) {
  const map = new Map(answers.map((a) => [a.id, a]));

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
}

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

async function onSubmit(
  event: FormSubmitEvent<{ name: string; description: string; cards: Card[] }>,
) {
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
      await refresh();

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
    state.name = newRes.name;
    state.description = newRes.description || '';
    state.cards = structuredClone(newRes.cards);
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
    duration: 2000,
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
    duration: 2000,
  });
}

function deleteCard(cardId?: UUID) {
  state.cards = state.cards?.filter((c) => c.id !== cardId);
}
</script>

<template>
  <SkeletonDeckDetailPage v-if="isFetching" />

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
            <AppFlashcard
              v-model:is-answers-saving="isAnswersSaving"
              :deck="{ id: deckId, slug: deckSlug }"
              :cards
              @answers-saved="onAnswersSaved"
              @restarted="onRestarted"
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

                  <UDropdownMenu :items="deckSettingOptions">
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
            </AppFlashcard>
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
                    v-if="!isAnswersSaving"
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
                  :disabled="isSaving"
                  @click="cancelEditing"
                />

                <UButton
                  :loading="isSaving"
                  :label="isSaving ? 'Saving...' : 'Save Changes'"
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
                    @click="deleteCard(c.id)"
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
