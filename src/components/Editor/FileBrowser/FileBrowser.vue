<template>
	<div
		class="self-stretch my-2 w-96 flex flex-col gap-2"
		v-if="instance.open.value"
	>
		<div class="bg-menuAlternate rounded h-16 flex items-center p-3 gap-3">
			<img :src="currentProject?.icon ?? ''" class="w-10 h-10" />
			<p class="text-3xl">{{ currentProject?.name }}</p>
		</div>
		<div class="bg-menuAlternate rounded flex-1 p-2">
			<div v-for="entry in entries">
				<File
					:name="basename(entry.path)"
					v-if="entry.type === 'file'"
				/>
				<Directory
					:name="basename(entry.path)"
					v-if="entry.type === 'directory'"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import File from './File.vue'
import Directory from './Directory.vue'

import { App } from '/@/App'
import { FileBrowser } from './FileBrowser'
import { BaseEntry } from '/@/libs/fileSystem/BaseFileSystem'
import { onMounted, onUnmounted, ref } from 'vue'
import { basename } from '/@/libs/path'

const currentProject = App.instance.projectManager.useCurrentProject()

const entries = ref<BaseEntry[]>([])

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return
	if (!currentProject.value) return

	if (path !== currentProject.value.path) return

	entries.value = await App.instance.fileSystem.readDirectoryEntries(
		currentProject.value.path
	)
}

onMounted(async () => {
	if (currentProject.value) updateEntries(currentProject.value.path)

	App.instance.fileSystem.eventSystem.on('updated', updateEntries)
})
onUnmounted(() => {
	App.instance.fileSystem.eventSystem.off('updated', updateEntries)
})

defineProps({
	instance: {
		type: FileBrowser,
		required: true,
	},
})
</script>
