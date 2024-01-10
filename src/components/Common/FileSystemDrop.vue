<script setup lang="ts">
import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'

const t = useTranslate()

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
			'border-menuAlternate': !hovered,
		}"
		@dragenter="hovered = true"
		@dragleave="hovered = false"
		@dragover.prevent
		@drop="dropped"
	>
		<span class="font-inter text-textAlternate select-none pointer-events-none">
			{{ t(text) }}
		</span>
	</div>
</template>
