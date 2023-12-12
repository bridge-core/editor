<template>
	<button
		class="bg-menu px-2 py-1 rounded transition-[colors, opacity] duration-100 ease-out select-none flex items-center gap-1 font-inter"
		:class="{
			'opacity-100 hover:bg-primary': enabled,
			'opacity-50 cursor-default': !enabled,
		}"
	>
		<Icon v-if="icon" :icon="icon" class="text-base -ml-0.5" />
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
