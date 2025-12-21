<script setup lang="ts">
const studyOptions = computed(() => [
  {
    label: 'Flashcards',
    icon: 'i-lucide-gallery-horizontal-end',
    // to: `/library/${store.slug}/flashcards?deckId=${store.deckId}`,
  },
  {
    label: 'Learn',
    icon: 'i-lucide-notebook-pen',
    // to: `/library/${store.slug}/learn?deckId=${store.deckId}`,
  },
  {
    label: 'Test',
    icon: 'i-lucide-flask-conical',
    // to: `/library/${store.slug}/test?deckId=${store.deckId}`,
  },
  {
    label: 'Coming soon',
    icon: '',
    to: `#`,
  },
]);
</script>

<template>
  <UContainer>
    <UButton
      to="/shared"
      class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to shared"
    />

    <h1 class="text-lg font-semibold sm:text-xl">
      Cillum amet excepteur cupidatat
    </h1>

    <p v-if="true" class="text-muted">
      Reprehenderit aliqua nostrud eu tempor.
    </p>

    <div class="my-4 flex flex-col-reverse gap-4 lg:flex-col">
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

      <div class="space-y-2">
        <UCard
          :ui="{
            body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
          }"
          class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
          variant="subtle"
        >
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-medium">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
                @click.stop="console.log('TTS not implemented yet')"
              />

              <!-- {{ !isFlipped ? 'Term' : 'Definition' }} -->
              Term
            </span>

            <!-- <CardStatusBadge :card="session.currentCard" /> -->
            <UBadge
              label="known"
              color="success"
              icon="i-lucide-graduation-cap"
              class="capitalize"
              variant="subtle"
            />
          </div>

          <div class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl">
            <!-- {{
            !isFlipped
              ? session.currentCard?.term
              : session.currentCard?.definition
          }} -->

            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </div>

          <div />
        </UCard>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="col-span-1">
            <!-- :to="`/${user?.username}`" -->
            <UButton variant="link" color="neutral" class="w-fit p-0">
              <div class="flex place-items-center gap-2">
                <UAvatar :src="''" alt="BC" size="xl" />

                <div class="flex flex-col">
                  <span class="text-muted text-start text-sm font-normal"
                    >Created by</span
                  >

                  <p class="text-default text-base font-medium">
                    <!-- {{ user!.username }} -->
                    BenjaminChang
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
              />
              <!-- @click="throttledHandleAnswer(false)" -->
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
              />
              <!-- @click="throttledHandleAnswer(true)" -->
            </UTooltip>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-6" />

    <div class="space-y-4">
      <h2 class="text-lg font-medium sm:text-xl">Cards (25)</h2>

      <TransitionGroup name="list" appear>
        <UCard
          v-for="(card, index) in Array.from({ length: 25 })"
          :key="index"
          class="bg-elevated shadow-md"
          variant="subtle"
        >
          <div class="flex flex-col sm:flex-row">
            <p class="w-full text-base font-medium sm:text-lg">
              cillum officia dolore Ex ut ut laborum proident ut nostrud.
            </p>

            <USeparator class="m-2 sm:hidden" />

            <USeparator
              orientation="vertical"
              class="m-2 hidden h-auto sm:block"
            />

            <p class="w-full text-base font-medium sm:text-lg">
              aute dolor pariatur ad sunt
            </p>
          </div>
        </UCard>
      </TransitionGroup>
    </div>
  </UContainer>
</template>

<style scoped></style>
