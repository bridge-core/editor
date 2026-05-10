<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import type { PromptWindow } from './PromptWindow'
import { Windows } from '../Windows'

const t = useTranslate()

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: PromptWindow }

const input = ref(window.defaultValue ?? '')

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
			<LabeledInput :label="t(window.label)" class="mb-4 max-w-sm flex-1 bg-background" v-slot="{ focus, blur }">
				<input
					class="bg-background outline-none placeholder:text-text-secondary max-w-none w-full font-theme"
					@focus="focus"
					@blur="blur"
					:placeholder="t(window.placeholder)"
					:value="input"
					@input="(event: Event) => (input = (<HTMLInputElement>event.target).value)"
				/>
			</LabeledInput>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-theme" @click="confirm" />
				<Button :text="t('Cancel')" class="font-theme" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
