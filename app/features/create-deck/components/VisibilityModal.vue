<script lang="ts" setup>
import { getVisibilityDesc, VISIBILITY_ITEMS } from "~/features/create-deck";
import { Visibility } from "~/features/deck";
import { focusInput, getVisibilityIcon } from "~/shared/utils";

const props = defineProps<{
	open: boolean;
	visibility: Visibility;
	passcode?: string | null;
}>();

const emit = defineEmits<{
	(event: "update:open", value: boolean): void;
	(event: "update:visibility", value: Visibility): void;
	(event: "update:passcode", value: string | null | undefined): void;
}>();

const passcodeRef = useTemplateRef("passcodeInput");

const isOpen = computed({
	get: () => props.open,
	set: (value: boolean) => emit("update:open", value),
});

const currentVisibility = computed({
	get: () => props.visibility,
	set: (value: Visibility) => emit("update:visibility", value),
});

const currentPasscode = computed({
	get: () => props.passcode,
	set: (value: string | null | undefined) => emit("update:passcode", value),
});

function handleVisibilityChange() {
	currentPasscode.value =
		currentVisibility.value === Visibility.PROTECTED ? "" : undefined;
}
</script>

<template>
	<UModal
		v-model:open="isOpen"
		:ui="{ title: 'text-base sm:text-lg font-medium' }"
		title="Manage your deck access"
	>
		<template #body>
			<UFormField
				:help="getVisibilityDesc(currentVisibility)"
				label="Visibility"
				name="visibility"
			>
				<USelect
					v-model="currentVisibility"
					:items="VISIBILITY_ITEMS"
					:icon="getVisibilityIcon(currentVisibility)"
					:ui="{ content: 'min-w-fit' }"
					value-key="id"
					@change="handleVisibilityChange"
				/>
			</UFormField>

			<UFormField
				v-if="currentVisibility === Visibility.PROTECTED"
				class="mt-2"
				label="Passcode"
				name="passcode"
				required
			>
				<UInput
					ref="passcodeInput"
					v-model="currentPasscode"
					@keydown.enter="isOpen = false"
					@vue:mounted="focusInput(passcodeRef?.inputRef, 300)"
				/>
			</UFormField>
		</template>
	</UModal>
</template>
