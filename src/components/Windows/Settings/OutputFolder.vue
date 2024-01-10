<script setup lang="ts">
import { settings } from '@/App'
import FileSystemDrop from '@/components/Common/FileSystemDrop.vue'

const { item } = defineProps(['item'])

async function droppedOutputFolder(items: DataTransferItemList) {
	const directoryHandle = await items[0].getAsFileSystemHandle()

	if (!directoryHandle) return
	if (!(directoryHandle instanceof FileSystemDirectoryHandle)) return

	settings.set(item.id, directoryHandle)
}
</script>

<template>
	<FileSystemDrop class="mt-8 mb-8 w-full h-48" text="Drop your output folder here." @drop="droppedOutputFolder" />
</template>
