<script setup lang="ts">
const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
	create: [payload: { name: string; deckIds: string[]; settings: any }];
}>();

const { token } = useAuth();

const roomName = ref("");
const selectedDeckIds = ref<string[]>([]);
const questionTypes = ref("both");
const endCondition = ref("first_finish");
const timeLimitMinutes = ref(5);
const maxPlayers = ref(4);

const { data: decks } = useFetch<any>("/api/decks", {
	headers: { Authorization: token.value || "" },
});

const deckOptions = computed(() => {
	if (!decks.value?.data) return [];
	return decks.value.data.map((d: any) => ({
		label: `${d.name} (${d.cards?.length ?? 0} cards)`,
		value: d.id,
	}));
});

const questionTypeOptions = [
	{ label: "Multiple Choice", value: "multiple_choices" },
	{ label: "Written", value: "written" },
	{ label: "Both", value: "both" },
];

const endConditionOptions = [
	{ label: "First to Finish", value: "first_finish" },
	{ label: "Time Limit", value: "time_limit" },
	{ label: "All Finish", value: "all_finish" },
];

function handleCreate() {
	if (!roomName.value || !selectedDeckIds.value.length) return;

	emit("create", {
		name: roomName.value,
		deckIds: selectedDeckIds.value,
		settings: {
			questionTypes: questionTypes.value,
			endCondition: endCondition.value,
			...(endCondition.value === "time_limit"
				? { timeLimitMinutes: timeLimitMinutes.value }
				: {}),
			maxPlayers: maxPlayers.value,
		},
	});
}
</script>

<template>
	<UModal v-model:open="open" title="Create Study Room">
		<template #body>
			<div class="space-y-4">
				<UFormField label="Room Name">
					<UInput v-model="roomName" placeholder="Enter room name" />
				</UFormField>

				<UFormField label="Select Decks">
					<div class="space-y-2">
						<label
							v-for="opt in deckOptions"
							:key="opt.value"
							class="flex items-center gap-2"
						>
							<input
								v-model="selectedDeckIds"
								type="checkbox"
								:value="opt.value"
								class="rounded"
							>
							<span class="text-sm">{{ opt.label }}</span>
						</label>
					</div>
				</UFormField>

				<UFormField label="Question Type">
					<USelect v-model="questionTypes" :items="questionTypeOptions" />
				</UFormField>

				<UFormField label="End Condition">
					<USelect v-model="endCondition" :items="endConditionOptions" />
				</UFormField>

				<UFormField
					v-if="endCondition === 'time_limit'"
					label="Time Limit (minutes)"
				>
					<UInput
						v-model.number="timeLimitMinutes"
						type="number"
						:min="1"
						:max="60"
					/>
				</UFormField>

				<UFormField label="Max Players">
					<UInput v-model.number="maxPlayers" type="number" :min="2" :max="8" />
				</UFormField>
			</div>
		</template>

		<template #footer>
			<div class="flex justify-end gap-2">
				<UButton
					label="Cancel"
					color="neutral"
					variant="outline"
					@click="open = false"
				/>
				<UButton
					label="Create"
					:disabled="!roomName || !selectedDeckIds.length"
					@click="handleCreate"
				/>
			</div>
		</template>
	</UModal>
</template>
