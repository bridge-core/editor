<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import Icon from './Icon.vue'

import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()

const props = defineProps<{
	label: string
	icon?: string
	borderColor?: string
}>()

const [model, modifiers] = defineModel()

function input(this: any, event: Event) {
	if (modifiers.lazy) return

	model.value = (<HTMLInputElement>event.target).value
}

function change(event: Event) {
	if (!modifiers.lazy) return

	model.value = (<HTMLInputElement>event.target).value
}
</script>

<template>
	<LabeledInput v-slot="{ focus, blur }" :label="t(label)" class="bg-background" :border-color="borderColor">
		<div class="flex gap-1">
			<Icon v-if="icon" :icon="icon" class="transition-colors duration-100 ease-out" />

			<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-theme flex-1" :value="model" @input="input" @change="change" />
		</div>
	</LabeledInput>
</template>
