<template>
	<button
		class="bg-menu px-2 py-1 rounded hover:bg-primary transition-colors duration-100 ease-out select-none flex items-center gap-1"
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
})
</script>
