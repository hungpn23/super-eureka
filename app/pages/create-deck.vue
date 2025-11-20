<script lang="ts" setup>
import * as v from 'valibot';
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui';
import { CardSeparator, ContentSeparator, Visibility } from '~/utils/enums';

const isImportModalOpen = ref(false);
const isSubmitting = ref(false);
const formErrorMsg = ref('');

const router = useRouter();
const toast = useToast();
const { token, data: user } = useAuth();

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  description: v.string(),
  visibility: v.enum(Visibility),
  passcode: v.optional(
    v.pipe(
      v.string(),
      v.minLength(4, 'Passcode must be at least 4 characters'),
      v.maxLength(20, 'Passcode must be at most 20 characters'),
    ),
  ),
  cards: v.pipe(
    v.array(
      v.object({
        term: v.pipe(v.string(), v.minLength(1, 'Term is required')),
        definition: v.pipe(
          v.string(),
          v.minLength(1, 'Definition is required'),
        ),
      }),
    ),
    v.minLength(4, 'At least 4 cards are required'),
  ),
});

const importSchema = v.object({
  cards: v.pipe(v.string(), v.minLength(1, 'Cards are required')),
});

type Schema = v.InferOutput<typeof schema>;
type ImportSchema = v.InferOutput<typeof importSchema>;

const payload = reactive<Schema>({
  name: '',
  description: '',
  visibility: Visibility.PUBLIC,
  passcode: undefined,
  cards: [
    { term: '', definition: '' },
    { term: '', definition: '' },
    { term: '', definition: '' },
    { term: '', definition: '' },
  ],
});

const importState = reactive({
  cards: '',
  contentSeparator: ContentSeparator.TAB,
  cardSeparator: CardSeparator.NEW_LINE,
  customContentSeparator: '-',
  customCardSeparator: '\\',
});

const contentSeparatorPreview = computed(
  () =>
    `Term${getContentSeparator(
      importState.contentSeparator,
      importState.customContentSeparator,
    )}Definition`,
);

const cardSeparatorPreview = computed(
  () =>
    `Card1${getCardSeparator(
      importState.cardSeparator,
      importState.customCardSeparator,
    )}Card2`,
);

const parsedCards = computed(() => {
  const sep = getContentSeparator(
    importState.contentSeparator,
    importState.customContentSeparator,
  );
  const cardSep = getCardSeparator(
    importState.cardSeparator,
    importState.customCardSeparator,
  );

  if (!importState.cards || !sep || !cardSep) return [];

  const cards = importState.cards
    .split(cardSep)
    .filter((card) => card.trim().length > 0);

  return cards.map((card) => {
    const [term = '', definition = ''] = card.split(sep);

    return { term, definition };
  });
});

watch(
  () => payload.visibility,
  (newVisibility) => {
    payload.passcode = newVisibility === Visibility.PROTECTED ? '' : undefined;
  },
);

async function onCreate(event: FormSubmitEvent<Schema>) {
  formErrorMsg.value = '';
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  $fetch<CreateDeckRes>('/api/decks', {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
    body: event.data,
  })
    .then((res) => {
      router.push('/home');

      toast.add({
        title: 'New deck created!',
        color: 'success',
        duration: 3000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Create failed!',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 3000,
      });
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

async function onImportSubmit(event: FormSubmitEvent<ImportSchema>) {
  const sep = getContentSeparator(
    importState.contentSeparator,
    importState.customContentSeparator,
  );

  const cardSep = getCardSeparator(
    importState.cardSeparator,
    importState.customCardSeparator,
  );

  if (!sep || !cardSep) {
    toast.add({
      title: 'Error importing cards',
      description: 'Invalid custom content or card separator',
      color: 'error',
      duration: 3000,
    });

    return;
  }

  const importCards = event.data.cards
    .split(cardSep)
    .filter((card) => card.trim().length > 0)
    .map((card) => {
      const [term = '', definition = ''] = card.split(sep);

      return { term, definition };
    });

  const currentCards = payload.cards.filter(
    (c) => c.term.trim().length > 0 || c.definition.trim().length > 0,
  );

  payload.cards = [...currentCards, ...importCards];

  isImportModalOpen.value = false;

  toast.add({
    title: 'Successfully imported!',
    color: 'success',
    duration: 3000,
  });
}

async function onError(event: FormErrorEvent) {
  const cardError = event.errors.find((e) => e.name === 'cards');

  formErrorMsg.value = cardError
    ? cardError.message
    : 'Please fill in all required fields.';
}
</script>

<template>
  <UPage>
    <UContainer>
      <UPageHeader
        :ui="{
          wrapper: 'sm:flex-row sm:items-center sm:place-content-between',
        }"
        title="Create a new deck"
      >
        <UAlert
          v-if="formErrorMsg"
          :description="formErrorMsg"
          class="mt-2"
          icon="i-lucide-alert-triangle"
          color="error"
          variant="soft"
          title="Validation Error"
        />

        <template #links>
          <UButton
            class="cursor-pointer"
            icon="i-lucide-plus"
            label="Create"
            color="primary"
            size="xl"
            type="submit"
            form="create-deck-form"
          />
        </template>
      </UPageHeader>

      <UPageBody>
        <UForm
          :schema="schema"
          :state="payload"
          id="create-deck-form"
          class="flex flex-col gap-4"
          @submit="onCreate"
          @error="onError"
        >
          <UModal
            :ui="{
              title: 'text-xl sm:text-2xl',
            }"
            class="w-fit"
            title="Manage your deck access"
          >
            <UButton
              :label="payload.visibility"
              :icon="getVisibilityIcon(payload.visibility)"
              class="cursor-pointer"
              color="neutral"
              variant="subtle"
              size="lg"
            />

            <template #body>
              <UFormField
                :help="getVisibilityDesc(payload.visibility)"
                label="Visibility"
                name="visibility"
              >
                <USelect
                  v-model="payload.visibility"
                  :items="Object.values(Visibility)"
                  :icon="getVisibilityIcon(payload.visibility)"
                  :ui="{ content: 'min-w-fit' }"
                  variant="subtle"
                />
              </UFormField>

              <UFormField
                v-if="payload.visibility === Visibility.PROTECTED"
                class="mt-2"
                label="Passcode"
                name="passcode"
                required
              >
                <UInput
                  v-model="payload.passcode"
                  placeholder="Enter your passcode..."
                />
              </UFormField>
            </template>
          </UModal>

          <UFormField label="Name" name="name" required>
            <UInput
              v-model="payload.name"
              :ui="{ base: 'sm:text-lg' }"
              class="w-full"
              variant="subtle"
              placeholder="Enter a name, like “Biology - Chapter 22: Evolution”"
            />
          </UFormField>

          <UFormField label="Description" name="description">
            <UTextarea
              v-model="payload.description"
              :rows="1"
              :maxrows="5"
              :ui="{
                base: 'sm:text-lg',
              }"
              class="w-full"
              placeholder="Describe your deck (optional)"
              variant="subtle"
              autoresize
            />
          </UFormField>

          <div class="flex place-items-center gap-4">
            <h2 class="text-xl font-bold text-pretty sm:text-2xl">
              Cards ({{ payload.cards.length }})
            </h2>

            <UModal
              v-model:open="isImportModalOpen"
              :ui="{
                title: 'text-xl sm:text-2xl',
                content:
                  'sm:inset-x-16 sm:inset-y-8 lg:inset-x-32 lg:inset-y-16 sm:rounded-md',
              }"
              class="w-fit"
              title="Import your cards"
              description="Copy and Paste your data here (from Word, Excel, Google Docs, CSV Files, etc.)"
              fullscreen
            >
              <UButton
                class="cursor-pointer"
                label="Import cards"
                icon="i-lucide-copy-plus"
                variant="subtle"
              />

              <template #body>
                <UForm
                  :schema="importSchema"
                  :state="importState"
                  id="import-form"
                  class="flex flex-col gap-4"
                  @submit="onImportSubmit"
                >
                  <UFormField name="cards">
                    <UTextarea
                      v-model="importState.cards"
                      :rows="7"
                      :maxrows="10"
                      class="w-full"
                      variant="subtle"
                      placeholder="Paste your data here..."
                      autoresize
                      autofocus
                    />
                  </UFormField>

                  <div
                    class="flex flex-col place-items-start gap-3 sm:flex-row sm:gap-6"
                  >
                    <div class="flex place-items-center gap-2">
                      <UFormField
                        :ui="{
                          help: 'whitespace-pre-wrap',
                        }"
                        :help="contentSeparatorPreview"
                        name="contentSeparator"
                      >
                        <USelect
                          v-model="importState.contentSeparator"
                          :items="Object.values(ContentSeparator)"
                          class="w-full"
                          variant="subtle"
                        />

                        <template #label>
                          <h3 class="truncate text-lg font-medium">
                            Content separator
                          </h3>
                        </template>
                      </UFormField>

                      <UFormField
                        v-if="
                          importState.contentSeparator ===
                          ContentSeparator.CUSTOM
                        "
                        name="customContentSeparator"
                      >
                        <UInput
                          v-model="importState.customContentSeparator"
                          class="mt-1"
                          placeholder="eg. -"
                        />
                      </UFormField>
                    </div>

                    <div class="flex place-items-center gap-2">
                      <UFormField
                        :ui="{
                          help: 'whitespace-pre-wrap',
                        }"
                        :help="cardSeparatorPreview"
                        name="cardSeparator"
                      >
                        <USelect
                          v-model="importState.cardSeparator"
                          :items="Object.values(CardSeparator)"
                          class="w-full"
                          variant="subtle"
                        />

                        <template #label>
                          <h3 class="truncate text-lg font-medium">
                            Card separator
                          </h3>
                        </template>
                      </UFormField>

                      <UFormField
                        v-if="
                          importState.cardSeparator === CardSeparator.CUSTOM
                        "
                        name="customCardSeparator"
                      >
                        <UInput
                          v-model="importState.customCardSeparator"
                          class="mt-1"
                          placeholder="eg. \"
                        />
                      </UFormField>
                    </div>
                  </div>

                  <h2 class="text-xl font-bold text-pretty sm:text-2xl">
                    Preview
                    <span class="text-base font-normal"
                      >{{ parsedCards.length }} cards</span
                    >
                  </h2>

                  <div class="flex flex-col gap-4">
                    <UCard
                      v-for="(c, index) in parsedCards"
                      :key="index"
                      variant="subtle"
                    >
                      <div class="flex flex-col sm:flex-row">
                        <UTextarea
                          v-model="c.term"
                          :rows="1"
                          :maxrows="10"
                          :ui="{
                            base: 'text-lg disabled:opacity-100 disabled:cursor-default',
                          }"
                          class="w-full"
                          variant="ghost"
                          disabled
                          autoresize
                        />

                        <USeparator class="m-2 sm:hidden" />

                        <USeparator
                          orientation="vertical"
                          class="m-2 hidden h-auto sm:block"
                        />

                        <UTextarea
                          v-model="c.definition"
                          :rows="1"
                          :maxrows="10"
                          :ui="{
                            base: 'text-lg disabled:opacity-100 disabled:cursor-default',
                          }"
                          class="w-full"
                          variant="ghost"
                          disabled
                          autoresize
                        />
                      </div>
                    </UCard>
                  </div>
                </UForm>
              </template>

              <template #footer>
                <div class="flex flex-1 place-content-end gap-2">
                  <UButton
                    class="cursor-pointer"
                    label="Cancel"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="outline"
                    @click="isImportModalOpen = false"
                  />

                  <UButton
                    class="cursor-pointer"
                    label="Import"
                    icon="i-lucide-copy-plus"
                    variant="subtle"
                    size="lg"
                    type="submit"
                    form="import-form"
                  />
                </div>
              </template>
            </UModal>
          </div>

          <TransitionGroup name="list">
            <UCard
              v-for="(c, index) in payload.cards"
              :key="index"
              variant="subtle"
            >
              <div
                class="mb-1 flex place-content-between place-items-center px-0"
              >
                <p class="text-lg font-medium sm:text-xl">{{ index + 1 }}</p>

                <UButton
                  class="cursor-pointer"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  @click="payload.cards.splice(index, 1)"
                />
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                  <UTextarea
                    v-model="c.term"
                    :rows="1"
                    :maxrows="10"
                    :ui="{
                      base: 'text-lg sm:text-xl',
                    }"
                    class="w-full"
                    placeholder="Enter your term..."
                    autoresize
                  />
                </UFormField>

                <UFormField
                  class="sm:flex-1"
                  :name="`cards.${index}.definition`"
                >
                  <UTextarea
                    v-model="c.definition"
                    :rows="1"
                    :maxrows="10"
                    :ui="{
                      base: 'text-lg sm:text-xl',
                    }"
                    class="w-full"
                    placeholder="Enter your definition..."
                    autoresize
                  />
                </UFormField>
              </div>
            </UCard>
          </TransitionGroup>

          <UButton
            class="cursor-pointer place-self-center px-4"
            label="Add a card"
            icon="i-lucide-plus"
            variant="subtle"
            size="xl"
            @click="payload.cards.push({ term: '', definition: '' })"
          />
        </UForm>
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
