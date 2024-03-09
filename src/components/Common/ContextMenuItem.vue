<script setup lang="ts">
import Icon from './Icon.vue'

import { useTranslate } from '@/libs/locales/Locales'

defineProps({
	icon: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
})

const t = useTranslate()
</script>

<template>
	<div
		class="flex item-center group hover:bg-background-tertiary p-2 px-4 cursor-pointer transition-colors duration-100 ease-out"
	>
		<Icon :icon="icon" class="text-base text-primary transition-colors duration-100 ease-out" />
		<span class="ml-2 font-inter select-none">{{ t(text) }}</span>
	</div>
</template>
