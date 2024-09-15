<script setup lang="ts">
import { ref } from 'vue'

defineProps({
	text: {
		type: String,
		required: true,
	},
})
const emit = defineEmits(['drop'])

const hovered = ref(false)

async function dropped(event: DragEvent) {
	event.preventDefault()
	event.stopPropagation()

	hovered.value = false

	if (!event.dataTransfer) return

	const items = event.dataTransfer.items

	emit('drop', items)
}
</script>

<template>
	<div
		class="border-2 border-dashed rounded flex justify-center items-center transition-colors duration-100 ease-out"
		:class="{
			'border-primary': hovered,
			'border-background-secondary': !hovered,
		}"
		@dragenter="hovered = true"
		@dragleave="hovered = false"
		@dragover.prevent
		@drop="dropped"
	>
		<span class="font-theme text-text-secondary select-none pointer-events-none">
			{{ text }}
		</span>
	</div>
</template>
