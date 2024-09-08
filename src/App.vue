<script setup lang="ts">
import { setup, setupBeforeComponents } from '@/App'

import Toolbar from '@/components/Toolbar/Toolbar.vue'
import Greet from '@/components/Greet/Greet.vue'
import Editor from '@/components/Editor/Editor.vue'
import Windows from '@/components/Windows/Windows.vue'
import { ImporterManager } from '@/libs/import/ImporterManager'
import { onMounted } from 'vue'

setupBeforeComponents()

onMounted(() => {
	setup()
})

async function drop(event: DragEvent) {
	const items = event.dataTransfer?.items

	if (!items) return

	const filePromises: Promise<FileSystemFileHandle | null>[] = []

	for (const item of items) {
		if (item.kind === 'file') {
			filePromises.push(<any>item.getAsFileSystemHandle())
		}
	}

	const files = (await Promise.all(filePromises)).filter((file) => file !== null)

	for (const file of files) {
		await ImporterManager.importFile(file)
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
