<template>
	<div class="flex items-center gap-1" @click="expanded = !expanded">
		<Icon icon="folder" :color="color" class="text-sm" />

		<span class="select-none"> {{ basename(path) }} </span>
	</div>

	<div class="ml-1 border-l pl-1 border-menu" v-show="expanded">
		<div v-for="entry in entries" :key="entry.path">
			<File
				:path="entry.path"
				:color="color"
				v-if="entry.type === 'file'"
			/>
			<Directory
				:path="entry.path"
				:color="color"
				v-if="entry.type === 'directory'"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from '/@/components/Common/Icon.vue'
import File from './File.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { basename } from '/@/libs/path'
import { BaseEntry } from '/@/libs/fileSystem/BaseFileSystem'
import { App } from '/@/App'

const props = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})

const entries: Ref<BaseEntry[]> = ref([])

const expanded = ref(false)

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return

	console.log(path)

	entries.value = await App.instance.fileSystem.readDirectoryEntries(
		props.path
	)
}

onMounted(async () => {
	App.instance.fileSystem.eventSystem.on('updated', updateEntries)

	updateEntries(props.path)
})

onUnmounted(() => {
	App.instance.fileSystem.eventSystem.off('updated', updateEntries)
})
</script>
