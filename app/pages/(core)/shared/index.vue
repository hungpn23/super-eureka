<script lang="ts" setup>
import { formatTimeAgo } from '@vueuse/core';

const toast = useToast();
const { token } = useAuth();
const { page, limit, filter, search, filterItems, query } = useDeckSearch();

const totalRecords = computed(
  () => paginated.value?.metadata.totalRecords || 0,
);

const {
  data: paginated,
  error,
  status,
} = useLazyFetch<Paginated<PublicDeck>, ErrorResponse>('/api/decks/public', {
  query,
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(error, (newErr) => {
  if (newErr) toast.add({ title: 'Error fetching decks' });
});
</script>

<template>
  <SkeletonCommunityPage v-if="status === 'idle' || status === 'pending'" />

  <UContainer v-else class="mt-4 space-y-2">
    <h1 class="mb-4 text-xl font-medium sm:text-2xl">
      Browse decks shared by community
    </h1>

    <div class="flex w-full place-content-between gap-2">
      <UInput
        v-model="search"
        class="sm:basis-1/2"
        icon="i-lucide-search"
        placeholder="Search decks..."
        autofocus
      />

      <USelect v-model="filter" :items="filterItems" value-key="id" />
    </div>

    <div
      v-if="paginated && paginated.metadata.totalRecords > 0"
      class="flex flex-col gap-3"
    >
      <TransitionGroup name="list" appear>
        <NuxtLink
          v-for="d in paginated.data"
          :key="d.id"
          :to="`/shared/${d.owner.username}/${d.slug}?deckId=${d.id}`"
        >
          <UCard
            :ui="{ body: 'space-y-4' }"
            class="hover:bg-elevated shadow-md transition-all hover:scale-101"
            variant="subtle"
          >
            <div
              class="flex flex-col sm:flex-row sm:place-items-center sm:gap-8"
            >
              <div class="flex min-w-0 flex-1 place-items-center gap-1.5">
                <h4 class="truncate font-medium sm:text-lg">
                  {{ d.name }}
                </h4>

                <UIcon
                  :name="getVisibilityIcon(d.visibility)"
                  class="shrink-0 sm:size-5"
                />
              </div>

              <div
                class="flex place-content-start place-items-center gap-1.5 sm:place-content-end"
              >
                <UTooltip :delay-duration="200" text="Total cards">
                  <UBadge
                    :label="d.totalCards"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-gallery-horizontal-end"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Views">
                  <UBadge
                    label="1"
                    icon="i-lucide-eye"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Cloned times">
                  <UBadge
                    label="318"
                    icon="i-lucide-git-fork"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>
              </div>
            </div>

            <UButton
              class="w-fit cursor-pointer p-0"
              variant="ghost"
              color="neutral"
            >
              <div class="flex place-items-center gap-2">
                <UAvatar
                  :ui="{ fallback: 'uppercase' }"
                  :src="d.owner.avatarUrl || ''"
                  :alt="d.owner.username"
                />

                <div class="flex flex-col">
                  <NuxtLink
                    :to="`/shared/${d.owner.username}`"
                    class="cursor-default place-self-start text-sm font-medium hover:underline sm:text-base"
                  >
                    {{ d.owner.username }}
                  </NuxtLink>

                  <p class="text-muted text-sm font-normal">
                    {{ `Created ${formatTimeAgo(new Date(d.createdAt))}` }}
                  </p>
                </div>
              </div>
            </UButton>
          </UCard>
        </NuxtLink>
      </TransitionGroup>
    </div>

    <div
      v-if="Array.isArray(paginated?.data) && paginated.data.length === 0"
      class="mt-12 flex flex-col items-center justify-center text-center"
    >
      <p class="text-muted text-lg">No decks found matching your search.</p>
    </div>

    <UPagination
      v-if="totalRecords > 0"
      v-model:page="page"
      :total="totalRecords"
      :items-per-page="Number(limit)"
      :ui="{ root: 'flex place-content-center mt-6' }"
    />
  </UContainer>
</template>
