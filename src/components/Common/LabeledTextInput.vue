<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import Icon from './Icon.vue'

import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()

const { modelValue, icon } = defineProps<{ label: string; modelValue: string; icon?: string; borderColor?: string }>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
	<LabeledInput v-slot="{ focus, blur }" :label="t(label)" class="bg-background" :border-color="borderColor">
		<div class="flex gap-1">
			<Icon v-if="icon" :icon="icon" class="transition-colors duration-100 ease-out" />

			<input
				@focus="focus"
				@blur="blur"
				class="outline-none border-none bg-transparent font-inter flex-1"
				v-bind:value="modelValue"
				@change="(event) => emit('update:modelValue', (<HTMLInputElement>event.target).value)"
			/>
		</div>
	</LabeledInput>
</template>
