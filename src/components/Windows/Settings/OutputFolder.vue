<script setup lang="ts">
import Warning from '@/components/Common/Warning.vue'

import FileSystemDrop from '@/components/Common/FileSystemDrop.vue'
import Info from '@/components/Common/Info.vue'
import { useSettings } from './Settings'

const { item } = defineProps(['item'])

const settings = useSettings()

async function droppedOutputFolder(items: DataTransferItemList) {
	const directoryHandle = await items[0].getAsFileSystemHandle()

	if (!directoryHandle) return
	if (!(directoryHandle instanceof FileSystemDirectoryHandle)) return

	settings.value.set(item.id, directoryHandle)
}
</script>

<template>
	<div class="w-full">
		<Warning
			v-if="!settings.get('outputFolder')"
			text="You have no default output folder set!"
			class="mt-4 mb-4 ml-auto mr-auto"
		/>

		<Info
			v-if="settings.get('outputFolder')"
			:text="`Your current output folder is '${settings.get('outputFolder').name}'`"
			class="mt-4 mb-4 ml-auto mr-auto"
		/>

		<FileSystemDrop class="mb-8 h-48" text="Drop your output folder here." @drop="droppedOutputFolder" />
	</div>
</template>
