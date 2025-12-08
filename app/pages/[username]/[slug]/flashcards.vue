<script setup lang="ts">
const {
  deck,
  status,
  deckId,
  deckSlug,
  username,
  onRestarted,
  onIgnoreDate,
  session,
  progress,
  handleAnswer,
} = useDeck();
</script>

<template>
  <SkeletonFlashcardsPage v-if="status === 'idle' || status === 'pending'" />

  <UContainer v-else>
    <AppFlashcard
      :title="deck?.name"
      :deck="{ id: deckId, title: deck?.name, slug: deckSlug }"
      :session="session"
      :progress
      @restarted="onRestarted"
      @ignore-date="onIgnoreDate"
      @answer="handleAnswer"
    >
      <template #routes>
        <div class="flex place-content-between place-items-center gap-2">
          <UButton
            :to="`/${username}/${deckSlug}?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            icon="i-lucide-move-left"
            label="Go back"
          />

          <UButton
            :to="`/${username}/${deckSlug}/learn?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            trailing-icon="i-lucide-move-right"
            label="Go to Learn"
          />
        </div>
      </template>
    </AppFlashcard>
  </UContainer>
</template>
