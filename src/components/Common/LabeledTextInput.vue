<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import Icon from './Icon.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { computed, Ref } from 'vue'

const t = useTranslate()

const props = defineProps<{
	label: string
	icon?: string
	placeholder?: string
	borderColor?: string
	rules?: ((value: string) => string | null)[]
}>()

const [model, modifiers] = defineModel<string>()

function input(this: any, event: Event) {
	if (modifiers.lazy) return

	model.value = (<HTMLInputElement>event.target).value
}

function change(event: Event) {
	if (!modifiers.lazy) return

	model.value = (<HTMLInputElement>event.target).value
}

const error: Ref<string | null> = computed(() => {
	if (!props.rules) return null

	for (const rule of props.rules) {
		const result = rule(model.value ?? '')

		if (result !== null) return result
	}

	return null
})
</script>

<template>
	<div class="bg-background">
		<LabeledInput v-slot="{ focus, blur }" :label="t(label)" class="bg-inherit" :border-color="borderColor" :invalid="error !== null">
			<div class="flex gap-1">
				<Icon v-if="icon" :icon="icon" class="transition-colors duration-100 ease-out" />

				<input
					@focus="focus"
					@blur="blur"
					class="outline-none border-none bg-transparent font-theme flex-1 placeholder:text-text-secondary"
					:value="model"
					@input="input"
					@change="change"
					:placeholder="placeholder ? t(placeholder) : ''"
				/>
			</div>
		</LabeledInput>

		<p v-if="rules" class="text-error font-theme text-xs mt-1 ml-3 min-h-[1rem]">{{ error ? t(error) : '' }}</p>
	</div>
</template>
