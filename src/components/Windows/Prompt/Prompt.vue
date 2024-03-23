<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'
import type { PromptWindow } from './PromptWindow'

const t = useTranslate()

const windowElement: Ref<Window | null> = ref(null)

const input = ref('')

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: PromptWindow }

function confirm() {
	if (!windowElement.value) return

	window.confirm(input.value)

	windowElement.value.close()
}

function cancel() {
	if (!windowElement.value) return

	window.cancel()

	windowElement.value.close()
}
</script>

<template>
	<Window :name="t(window.name.value)" id="prompt" ref="windowElement">
		<div class="px-4 pb-4">
			<LabeledInput :label="t(window.label)" class="mb-4 max-w-sm flex-1 bg-background" v-slot="{ focus, blur }">
				<input
					class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full font-inter"
					@focus="focus"
					@blur="blur"
					:placeholder="t(window.placeholder)"
					:value="input"
					@input="(event: Event) => (input = (<HTMLInputElement>event.target).value)"
				/>
			</LabeledInput>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-inter" @click="confirm" />
				<Button :text="t('Cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
