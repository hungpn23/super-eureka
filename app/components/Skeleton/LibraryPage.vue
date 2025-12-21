<template>
  <UContainer>
    <UPageHeader>
      <template #title>
        <USkeleton class="h-8 w-64" />
      </template>
      <template #description>
        <USkeleton class="mt-2 h-5 w-96" />
      </template>

      <UPageGrid class="mt-4 sm:grid-cols-1 md:grid-cols-3">
        <UPageCard v-for="n in 3" :key="n" variant="subtle">
          <div class="flex place-content-between items-center">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-8 w-8 rounded-md" />
          </div>
          <USkeleton class="mt-2 h-9 w-16" />
        </UPageCard>
      </UPageGrid>
    </UPageHeader>

    <UPageBody class="space-y-4">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:place-content-between sm:items-center"
      >
        <div class="flex items-center gap-4">
          <!-- Title -->
          <USkeleton class="h-8 w-40" />
          <!-- Button -->
          <USkeleton class="h-10 w-36 rounded-md" />
        </div>

        <div class="flex items-center gap-4">
          <!-- Search -->
          <USkeleton class="h-8 w-48 rounded-md" />
          <!-- Filter -->
          <USkeleton class="h-8 w-32 rounded-md" />
        </div>
      </div>

      <UPageList divide>
        <UPageCard v-for="n in 5" :key="n" class="my-1.5" variant="subtle">
          <template #title>
            <div class="flex items-center gap-2">
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-4 w-4" />
            </div>
          </template>

          <USkeleton class="h-4 w-3/4" />
        </UPageCard>
      </UPageList>

      <div class="mt-4 flex place-content-center">
        <div class="flex justify-center gap-2">
          <USkeleton v-for="p in 5" :key="p" class="h-9 w-9 rounded-md" />
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>
