<template>
  <UPage>
    <UContainer>
      <!-- Skeleton cho Header -->
      <UPageHeader>
        <!-- Skeleton cho Title -->
        <USkeleton class="h-10 w-1/2 rounded-lg" />

        <!-- Skeleton cho các nút Study -->
        <UPageGrid class="mt-4 gap-4">
          <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-lg" />
        </UPageGrid>

        <!-- Skeleton cho Flashcard lớn -->
        <USkeleton class="mx-auto mt-4 h-80 rounded-lg sm:h-[650px]" />

        <!-- Skeleton cho Description -->
        <template #description>
          <div class="mt-4 space-y-2">
            <USkeleton class="h-4 w-full rounded" />
            <USkeleton class="h-4 w-11/12 rounded" />
            <USkeleton class="h-4 w-3/4 rounded" />
          </div>

          <!-- Skeleton cho thông tin User -->
          <USkeleton class="mt-4 mb-4 h-10 w-40 rounded-lg" />
        </template>
      </UPageHeader>

      <!-- Skeleton cho Body (Danh sách Cards) -->
      <UPageBody class="mt-4 space-y-4">
        <div class="mb-2 flex place-content-between place-items-center">
          <!-- Skeleton cho tiêu đề "Cards (x)" -->
          <USkeleton class="h-8 w-32 rounded-lg" />

          <!-- Skeleton cho nút "Edit" -->
          <USkeleton class="h-10 w-24 rounded-lg" />
        </div>

        <!-- Skeleton cho danh sách Card (lặp lại 3 lần) -->
        <UCard v-for="i in 3" :key="i">
          <div
            class="mb-2 flex place-content-between place-items-center px-2.5"
          >
            <!-- Skeleton cho Badge status -->
            <USkeleton class="h-6 w-16 rounded-md" />
          </div>

          <div class="flex flex-col sm:flex-row">
            <!-- Skeleton cho Term -->
            <USkeleton class="h-10 w-full rounded-md" />

            <USeparator class="m-2 sm:hidden" />
            <USeparator
              orientation="vertical"
              class="m-2 hidden h-auto sm:block"
            />

            <!-- Skeleton cho Definition -->
            <USkeleton class="h-10 w-full rounded-md" />
          </div>
        </UCard>
      </UPageBody>
    </UContainer>
  </UPage>
</template>
