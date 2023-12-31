<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="absolute" ref="editorContainer">
			<div class="w-full" ref="editorElement" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'

const { instance }: { instance: TextTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const tabElement: Ref<HTMLDivElement | null> = ref(null)
const editorContainer: Ref<HTMLDivElement | null> = ref(null)
const editorElement: Ref<HTMLDivElement | null> = ref(null)

const resizeObserver = new ResizeObserver((entries) => {
	if (!tabElement.value) return
	if (!editorContainer.value) return

	editorContainer.value.style.width =
		tabElement.value.getBoundingClientRect().width + 'px'

	editorContainer.value.style.height =
		tabElement.value.getBoundingClientRect().height + 'px'
})

onMounted(async () => {
	if (!tabElement.value) return
	if (!editorContainer.value) return
	if (!editorElement.value) return

	resizeObserver.observe(tabElement.value)

	await instance.mountEditor(editorElement.value)
})

onUnmounted(() => {
	if (!editorElement.value) return

	instance.unmountEditor()
})
</script>
