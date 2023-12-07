<template>
	<div ref="editorElement" class="w-full h-full" />
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'

const { instance }: { instance: TextTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const editorElement: Ref<HTMLDivElement | null> = ref(null)

onMounted(async () => {
	if (!editorElement.value) return

	await instance.mountEditor(editorElement.value)
})

onUnmounted(() => {
	instance.unmountEditor()
})
</script>
