<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import LabeledDropdown from '@/components/Common/LabeledDropdown.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import type { DropdownWindow } from './DropdownWindow'
import { Windows } from '../Windows'

const t = useTranslate()

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: DropdownWindow }

const input = ref(window.defaultValue ?? window.options[0] ?? '')

function confirm() {
	window.confirm(input.value)

	Windows.close(window)
}

function cancel() {
	window.cancel()

	Windows.close(window)
}
</script>

<template>
	<Window :name="t(window.name.value)" @close="cancel">
		<div class="px-4 pb-4">
			<LabeledDropdown
				:label="t(window.label)"
				:options="window.options"
				class="mb-4 max-w-sm flex-1 bg-background"
				v-model="input"
			/>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-inter" @click="confirm" />
				<Button :text="t('Cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
