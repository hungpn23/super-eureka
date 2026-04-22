<script lang="ts" setup>
import { formatTimeAgo } from "@vueuse/core";
import {
	DeckFormId,
	type GetSharedDecksData,
	type GetSharedDecksResponse,
	useDeckClone,
	useDeckSearch,
	useDeckToasts,
} from "~/features/deck";
import { ShortcutKey } from "~/shared/enums";
import type { ErrorResponse, UUID } from "~/shared/types";
import { focusInput, getVisibilityIcon } from "~/shared/utils";
import { CLONE_DECK_SCHEMA } from "~/valibot/schemas";

definePageMeta({ auth: false });

const toast = useDeckToasts();
const { token, data: user } = useAuth();
const { page, limit, filter, filterItems, search, searchApiParams } =
	useDeckSearch();

const searchRef = useTemplateRef("searchInput");

const deckId = ref<UUID | null>(null);

const { state, isModalOpen, isCloning, addToLibrary, handleSubmit } =
	useDeckClone(deckId);

const totalRecords = computed(
	() => paginated.value?.metadata.totalRecords || 0,
);

const { data: paginated, error: getDecksError } = useFetch<
	GetSharedDecksResponse,
	ErrorResponse
>("/api/decks/shared", {
	method: "GET",
	headers: { Authorization: token.value || "" },
	query: computed(() => ({
		...searchApiParams.value,
		visitorId: user.value?.id,
	})),
});

watch(getDecksError, () => {
	if (getDecksError.value) toast.getSharedDecksFailed();
});

function handleAddToLibrary(deck: GetSharedDecksData) {
	deckId.value = deck.id;
	addToLibrary(deck.visibility);
}

defineShortcuts({
	[ShortcutKey.SEARCH]: () => {
		focusInput(searchRef.value?.inputRef);
	},
});
</script>

<template>
	<UContainer class="mt-4 space-y-2">
		<h1 class="mb-4 text-lg sm:text-xl font-medium">
			Browse decks shared by community
		</h1>

		<div class="flex w-full place-content-between gap-2">
			<UInput
				ref="searchInput"
				v-model="search"
				class="sm:basis-1/2"
				icon="i-lucide-search"
				placeholder="Search decks..."
				autofocus
			>
				<template #trailing>
					<UKbd class="hidden sm:flex" value="/" />
				</template>
			</UInput>

			<USelect v-model="filter" :items="filterItems" value-key="id" />
		</div>

		<div
			v-if="paginated && paginated.metadata.totalRecords > 0"
			class="flex flex-col gap-3"
		>
			<TransitionGroup name="list" appear>
				<NuxtLink
					v-for="d in paginated.data"
					v-slot="{ navigate }"
					:key="d.id"
					:to="`/shared/${d.owner.username}/${d.slug}?deckId=${d.id}`"
					custom
				>
					<UCard
						:ui="{ body: 'flex flex-col gap-2' }"
						class="hover:shadow-md transition-all hover:ring hover:ring-primary"
						variant="outline"
						@click="navigate"
					>
						<div
							class="flex flex-col gap-3 sm:flex-row sm:place-items-center sm:gap-8"
						>
							<div class="flex min-w-0 flex-1 place-items-center gap-1.5">
								<h4 class="truncate font-medium">{{ d.name }}</h4>

								<UIcon
									class="shrink-0 text-muted"
									:name="getVisibilityIcon(d.visibility)"
								/>
							</div>

							<div
								class="flex flex-wrap place-items-center gap-x-2 gap-y-1 text-sm text-muted sm:place-content-end"
							>
								<div class="flex place-items-center gap-1.5">
									<UIcon
										class="shrink-0"
										name="i-lucide-gallery-horizontal-end"
									/>
									<span class="font-medium text-default">
										{{ d.totalCards }}
									</span>
									<span>{{ d.totalCards === 1 ? "card" : "cards" }}</span>
								</div>

								<span class="hidden sm:inline text-muted/60">·</span>

								<div class="flex place-items-center gap-1.5">
									<UIcon class="shrink-0" name="i-lucide-eye" />
									<span class="font-medium text-default">
										{{ d.viewCount }}
									</span>
									<span>{{ d.viewCount === 1 ? "view" : "views" }}</span>
								</div>

								<span class="hidden sm:inline text-muted/60">·</span>

								<div class="flex place-items-center gap-1.5">
									<UIcon class="shrink-0" name="i-lucide-users" />
									<span class="font-medium text-default">
										{{ d.learnerCount }}
									</span>
									<span>
										{{ d.learnerCount === 1 ? "learner" : "learners" }}
									</span>
								</div>
							</div>
						</div>

						<div class="flex place-content-between place-items-center gap-2">
							<UUser
								v-if="d.owner.id"
								target="_self"
								:description="`Created ${formatTimeAgo(new Date(d.createdAt))}`"
								:to="`/shared/${d.owner.username}`"
								:name="d.owner.username"
								:avatar="{
                  src: d.owner.avatar?.url || '',
                  alt: d.owner.username,
                  loading: 'lazy',
                  icon: 'i-lucide-user',
                }"
							/>

							<UButton
								class="cursor-pointer transition-all active:scale-90"
								label="Add to library"
								icon="i-lucide-plus"
								variant="soft"
								size="sm"
								@click.stop="() => handleAddToLibrary(d)"
							/>
						</div>
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

		<UModal
			v-model:open="isModalOpen"
			:ui="{ footer: 'place-content-end' }"
			title="Hold on!"
			description="This deck is protected. Please enter the passcode to continue."
		>
			<template #body>
				<UForm
					:id="DeckFormId.CLONE_DECK"
					:schema="CLONE_DECK_SCHEMA"
					:state="state"
					@submit="handleSubmit"
				>
					<UFormField name="passcode" label="Passcode" required>
						<UInput
							v-model="state.passcode"
							type="password"
							placeholder="Enter passcode"
							autofocus
						/>
					</UFormField>
				</UForm>
			</template>

			<template #footer="{ close }">
				<UButton
					label="Cancel"
					color="neutral"
					variant="outline"
					:disabled="isCloning"
					@click="close"
				/>

				<UButton :form="DeckFormId.CLONE_DECK" type="submit">
					Add to Library
				</UButton>
			</template>
		</UModal>
	</UContainer>
</template>
