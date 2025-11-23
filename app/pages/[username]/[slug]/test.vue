<script setup lang="ts">
import * as v from 'valibot';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import type { FormSubmitEvent } from '@nuxt/ui';

const answerWithItems = ['Term', 'Definition', 'Both'];
const options = [
  { id: 1, text: 'aliquip', key: '1' },
  { id: 2, text: 'duis fugiat nisi', key: '2' },
  {
    id: 3,
    text: 'id velit dolor culpa est tempor duis veniam magna amet',
    key: '3',
  },
  {
    id: 4,
    text: 'cupidatat pariatur incididunt fugiat anim cupidatat',
    key: '4',
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);

const smAndLarger = breakpoints.greaterOrEqual('sm');

const settingSchema = v.object({
  questionCount: v.pipe(v.number(), v.minValue(1), v.maxValue(49)),
  answerWith: v.picklist(answerWithItems),
  isTrueFalse: v.boolean(),
  isMultipleChoice: v.boolean(),
  isWritten: v.boolean(),
});

type Schema = v.InferOutput<typeof settingSchema>;

const isOpen = ref(false);

const settingState = reactive<Schema>({
  questionCount: 20,
  answerWith: 'Both',
  isTrueFalse: false,
  isMultipleChoice: true,
  isWritten: false,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Starting test with config:', event.data);

  isOpen.value = false;
}

onMounted(() => {
  isOpen.value = false; // temp
});
</script>

<template>
  <UContainer>
    <div class="my-2 flex flex-col gap-2">
      <div class="flex place-content-between place-items-center gap-2">
        <UButton
          to="/home"
          class="cursor-pointer px-0 text-base"
          variant="link"
          icon="i-lucide-move-left"
          label="Back to Learn"
        />

        <div class="flex place-content-between place-items-center">
          <UButton
            icon="i-lucide-list"
            variant="ghost"
            color="neutral"
            size="xl"
            @click="isOpen = true"
          />

          <UModal
            v-model:open="isOpen"
            :fullscreen="!smAndLarger"
            :ui="{
              content: 'divide-none',
              body: 'flex-initial',
              footer: 'place-content-end',
            }"
            description="Some title and stuff of course"
          >
            <UButton
              :size="smAndLarger ? 'xl' : 'lg'"
              icon="i-lucide-settings"
              variant="ghost"
              color="neutral"
              @click="isOpen = true"
            />

            <template #title>
              <h2 class="text-2xl font-semibold sm:text-3xl">Settings</h2>
            </template>

            <template #body>
              <UForm
                :schema="settingSchema"
                :state="settingState"
                id="settings"
                class="flex flex-col gap-2 text-base font-medium sm:text-lg"
                @submit="onSubmit"
              >
                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>
                    Questions

                    <span class="text-sm text-current/50 sm:text-base">
                      (max 49)
                    </span>
                  </div>

                  <UFormField name="questionCount">
                    <UInput
                      v-model="settingState.questionCount"
                      class="w-20"
                      type="number"
                      size="lg"
                    />
                  </UFormField>
                </div>

                <USeparator label="Question format" />

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>True/False</div>

                  <UFormField name="isTrueFalse">
                    <USwitch v-model="settingState.isTrueFalse" size="lg" />
                  </UFormField>
                </div>

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Multiple choices</div>

                  <UFormField name="isMultipleChoice">
                    <USwitch
                      v-model="settingState.isMultipleChoice"
                      size="lg"
                    />
                  </UFormField>
                </div>

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Written</div>

                  <UFormField name="isWritten">
                    <USwitch v-model="settingState.isWritten" size="lg" />
                  </UFormField>
                </div>

                <USeparator label="Answer format" />

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Answer with</div>

                  <UFormField name="answerWith">
                    <USelect
                      v-model="settingState.answerWith"
                      :items="answerWithItems"
                      :ui="{ content: 'min-w-fit' }"
                      size="lg"
                    />
                  </UFormField>
                </div>

                <div
                  class="flex place-content-between place-items-center gap-2"
                >
                  <div>Grading options</div>

                  <UFormField name="answerWith">
                    <USelect
                      v-model="settingState.answerWith"
                      :items="answerWithItems"
                      :ui="{ content: 'min-w-fit' }"
                      size="lg"
                      disabled
                    />
                  </UFormField>
                </div>
              </UForm>
            </template>

            <template #footer>
              <UButton
                label="Cancel"
                color="neutral"
                variant="outline"
                size="lg"
                @click="isOpen = false"
              />

              <UButton
                type="submit"
                form="settings"
                label="Submit"
                color="neutral"
                size="lg"
              />
            </template>
          </UModal>

          <UButton
            :size="smAndLarger ? 'xl' : 'lg'"
            icon="i-lucide-house"
            variant="ghost"
            color="neutral"
            @click="isOpen = true"
          />
        </div>
      </div>

      <h1 class="place-self-center text-lg font-semibold sm:text-xl">
        Some title and stuff of course
      </h1>

      <div class="flex flex-col gap-4">
        <UCard
          :ui="{
            body: 'p-2 sm:p-4 w-full flex flex-col gap-2 sm:gap-4 place-content-between',
          }"
          class="flex min-h-[50dvh] shadow-md"
          variant="outline"
        >
          <UBadge
            class="place-self-end"
            label="1 of 20"
            variant="outline"
            color="neutral"
          />

          <div class="text-xl font-medium sm:text-2xl">Ability</div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <span class="font-bold">Choose your answer</span>

            <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
              <UButton
                v-for="(opt, index) in options"
                :key="opt.id"
                variant="outline"
                color="neutral"
                class="flex w-full cursor-pointer place-items-center gap-2 rounded-lg p-3 transition-all hover:scale-102 hover:shadow active:scale-95"
              >
                <UButton
                  class="hover:none hidden h-8 w-8 place-content-center place-items-center rounded-full font-bold sm:flex"
                  variant="subtle"
                  color="neutral"
                  >{{ index + 1 }}</UButton
                >

                <span class="text-start text-lg font-medium">
                  {{ opt.text }}
                </span>
              </UButton>
            </div>

            <UButton
              class="cursor-pointer place-self-end font-medium"
              variant="ghost"
            >
              Skip
            </UButton>
          </div>
        </UCard>

        <UCard
          :ui="{
            body: 'w-full p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 place-content-between',
          }"
          class="flex min-h-[50dvh] shadow-md"
          variant="outline"
        >
          <UBadge
            class="place-self-end"
            label="1 of 20"
            variant="outline"
            color="neutral"
          />

          <div class="text-xl font-medium sm:text-2xl">
            Ability to understand spoken words, sentences, and conversations.
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <span class="font-bold">Write your answer</span>

            <UInput
              :ui="{ base: 'text-lg sm:text-xl' }"
              class="w-full"
              variant="outline"
            />

            <UButton
              class="cursor-pointer place-self-end font-medium"
              variant="ghost"
            >
              Skip
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
