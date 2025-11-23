<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

// 1. Define Schema cho Form (Validation)
// Giới hạn số câu hỏi max là 49 như trong hình
const schema = z.object({
  questionCount: z.number().min(1).max(49, 'Max questions is 49'),
  answerWith: z.string(),
  isTrueFalse: z.boolean(),
  isMultipleChoice: z.boolean(),
  isWritten: z.boolean(),
});

type Schema = z.output<typeof schema>;

// 2. Default State (Giá trị mặc định)
// Nếu user đóng modal, giá trị này sẽ được giữ nguyên
const state = reactive<Schema>({
  questionCount: 20,
  answerWith: 'both',
  isTrueFalse: false,
  isMultipleChoice: true,
  isWritten: false,
});

// Options cho Select "Answer with"
const answerOptions = [
  { label: 'Term', value: 'term' },
  { label: 'Definition', value: 'definition' },
  { label: 'Both', value: 'both' },
];

// 3. Control Modal Visibility
const isOpen = ref(false);

// Tự động mở modal khi component được mount (vào trang)
onMounted(() => {
  isOpen.value = true;
});

// 4. Handle Submit (Nút Start Test)
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  // Xử lý logic khi user bấm Start Test
  console.log('Starting test with config:', event.data);

  // Đóng modal sau khi submit
  isOpen.value = false;

  // TODO: Redirect hoặc gọi API lấy câu hỏi
};

// Handle khi modal đóng (User click ra ngoài hoặc bấm X)
// Logic: Không làm gì cả, giữ nguyên default state hoặc state hiện tại user đã chỉnh
const onModalClose = () => {
  console.log('Modal closed. Using current state as default:', state);
};
</script>

<template>
  <div class="p-4">
    <UButton label="Open Test Settings" @click="isOpen = true" />

    <UModal v-model="isOpen" @close="onModalClose">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Better Quizlet
              </h3>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Set up your test
              </h2>
            </div>
            <div class="rounded-lg bg-blue-500 p-2">
              <UIcon
                name="i-heroicons-document-text"
                class="h-8 w-8 text-white"
              />
            </div>
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-6 py-2"
          @submit="onSubmit"
        >
          <div class="flex items-center justify-between">
            <label class="font-medium text-gray-900 dark:text-white">
              Questions
              <span class="text-sm font-normal text-gray-500">(max 49)</span>
            </label>
            <UFormGroup name="questionCount">
              <UInput
                v-model.number="state.questionCount"
                type="number"
                class="w-24"
              />
            </UFormGroup>
          </div>

          <div class="flex items-center justify-between">
            <label class="font-medium text-gray-900 dark:text-white">
              Answer with
            </label>
            <UFormGroup name="answerWith">
              <USelectMenu
                v-model="state.answerWith"
                :options="answerOptions"
                value-attribute="value"
                option-attribute="label"
                class="w-32"
              />
            </UFormGroup>
          </div>

          <UDivider />

          <div class="flex items-center justify-between">
            <label class="font-medium text-gray-900 dark:text-white"
              >True/False</label
            >
            <UToggle v-model="state.isTrueFalse" />
          </div>

          <div class="flex items-center justify-between">
            <label class="font-medium text-gray-900 dark:text-white"
              >Multiple choice</label
            >
            <UToggle v-model="state.isMultipleChoice" />
          </div>

          <div class="flex items-center justify-between">
            <label class="font-medium text-gray-900 dark:text-white"
              >Written</label
            >
            <UToggle v-model="state.isWritten" />
          </div>

          <div class="pt-4">
            <UButton
              type="submit"
              block
              size="xl"
              color="primary"
              label="Start test"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
