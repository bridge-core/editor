<template>
	<div ref="editorElement" class="w-full h-full" />
</template>

<script setup lang="ts">
import { Ref, markRaw, onMounted, onUnmounted, ref } from 'vue'
import { Uri, editor as monaco } from 'monaco-editor'
import { fileSystem } from '@/App'

const { instance } = defineProps({
	instance: {
		type: Object,
		required: true,
	},
})

const editorElement: Ref<HTMLDivElement | null> = ref(null)

let editor: monaco.IStandaloneCodeEditor | null = null
let model: monaco.ITextModel | null = null

onMounted(async () => {
	if (!editorElement.value) return

	editor = markRaw(
		monaco.create(editorElement.value, {
			fontFamily: 'Consolas',
		})
	)

	instance.updateEditorTheme()

	const fileContent = await fileSystem.readFileText(instance.path)

	model = markRaw(
		monaco.createModel(fileContent, 'json', Uri.file(instance.path))
	)

	editor.setModel(model)
})

onUnmounted(() => {
	if (editor === null) return

	editor?.dispose()

	if (model === null) return

	model?.dispose()
})
</script>
