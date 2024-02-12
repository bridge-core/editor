<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'

import { promptWindow } from '@/App'
import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'

const t = useTranslate()

const window: Ref<Window | null> = ref(null)

const input = ref('')

function confirm() {
	if (!window.value) return

	promptWindow.confirm(input.value)

	window.value.close()
}

function cancel() {
	if (!window.value) return

	promptWindow.cancel()

	window.value.close()
}
</script>

<template>
	<Window :name="t(promptWindow.name.value)" id="prompt" ref="window">
		<div class="px-4 pb-4">
			<LabeledInput
				:label="t(promptWindow.label)"
				class="mb-4 max-w-sm flex-1 bg-background"
				v-slot="{ focus, blur }"
			>
				<input
					class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full font-inter"
					@focus="focus"
					@blur="blur"
					:placeholder="t(promptWindow.placeholder)"
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
