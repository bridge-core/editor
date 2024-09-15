<template>
	<button
		class="bg-primary px-2 py-1 rounded transition-[colors, opacity] duration-100 ease-out select-none flex items-center gap-1 font-theme group hover:text-background"
		:class="{
			'hover:bg-text': enabled,
			'bg-menu cursor-default': !enabled,
		}"
	>
		<Icon v-if="icon" :icon="icon" class="text-base -ml-0.5 group-hover:text-background" />
		{{ text }}
	</button>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

defineProps({
	text: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
	},
	enabled: {
		type: Boolean,
		default: true,
	},
})
</script>
