<script setup lang="ts">
import { setup, setupBeforeComponents } from '@/App'

import Toolbar from '@/components/Toolbar/Toolbar.vue'
import Greet from '@/components/Greet/Greet.vue'
import Editor from '@/components/Editor/Editor.vue'
import Windows from '@/components/Windows/Windows.vue'
import { ImporterManager } from '@/libs/import/ImporterManager'
import { onMounted } from 'vue'
import { ImportedDirectoryEntry, ImportedFileEntry } from '@/libs/fileSystem/FileSystem'

setupBeforeComponents()

onMounted(() => {
	setup()
})

function drop(event: DragEvent) {
	const items = event.dataTransfer?.items

	if (!items) return

	// DataTransferItem entries are only valid synchronously inside the event handler, so collect everything
	// before awaiting. Chromium/web exposes the File System Access API; WebKitGTK (the native build) does not,
	// so we fall back to plain File objects there.
	const handlePromises: Promise<FileSystemHandle | null>[] = []
	const files: File[] = []

	for (const item of items) {
		if (item.kind !== 'file') continue

		if (typeof (item as any).getAsFileSystemHandle === 'function') {
			handlePromises.push((item as any).getAsFileSystemHandle())
		} else {
			const file = item.getAsFile()

			if (file) files.push(file)
		}
	}

	importDropped(handlePromises, files)
}

async function importDropped(handlePromises: Promise<FileSystemHandle | null>[], files: File[]) {
	const handles = (await Promise.all(handlePromises)).filter((handle) => handle !== null)

	for (const handle of handles) {
		if (handle.kind === 'file') {
			await ImporterManager.importFile(await ImportedFileEntry.fromHandle(handle as FileSystemFileHandle))
		} else {
			const entry = await ImportedDirectoryEntry.fromHandle(handle as FileSystemDirectoryHandle)

			if (!entry) continue

			await ImporterManager.importDirectory(entry)
		}
	}

	for (const file of files) {
		await ImporterManager.importFile(new ImportedFileEntry('/' + file.name, await file.arrayBuffer()))
	}
}
</script>

<template>
	<main class="w-screen h-screen bg-background" @drop.prevent="drop" @dragover.prevent="" @dragenter.prevent="">
		<Toolbar />
		<Editor />
		<Greet />
		<Windows />
	</main>
</template>
