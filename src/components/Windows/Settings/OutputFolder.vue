<script setup lang="ts">
import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import { settings } from '@/App'

const t = useTranslate()

const { item } = defineProps(['item'])

const outputFolderInputHovered = ref(false)

async function droppedOutputFolder(event: DragEvent) {
	event.preventDefault()
	event.stopPropagation()

	outputFolderInputHovered.value = false

	if (!event.dataTransfer) return

	const items = event.dataTransfer.items

	const directoryHandle = await items[0].getAsFileSystemHandle()

	if (!directoryHandle) return
	if (!(directoryHandle instanceof FileSystemDirectoryHandle)) return

	settings.set(item.id, directoryHandle)
}
</script>

<template>
	<div
		class="mt-8 mb-8 w-full h-48 border-2 border-dashed rounded flex justify-center items-center transition-colors duration-100 ease-out"
		:class="{
			'border-primary': outputFolderInputHovered,
			'border-menuAlternate': !outputFolderInputHovered,
		}"
		@dragenter="outputFolderInputHovered = true"
		@dragleave="outputFolderInputHovered = false"
		@dragover.prevent
		@drop="droppedOutputFolder"
	>
		<span class="font-inter text-textAlternate select-none pointer-events-none">
			{{ t('Drop your output folder here.') }}
		</span>
	</div>
</template>
