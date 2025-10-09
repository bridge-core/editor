<script setup lang="ts">
import Warning from '@/components/Common/Warning.vue'
import TextButton from '@/components/Common/TextButton.vue'

import FileSystemDrop from '@/components/Common/FileSystemDrop.vue'
import Info from '@/components/Common/Info.vue'
import { Settings } from '@/libs/settings/Settings'
import { useTranslate } from '@/libs/locales/Locales'
import { useUsingProjectOutputFolder } from '@/libs/project/ProjectManager'

const t = useTranslate()

defineProps(['item'])

const get = Settings.useGet()
const usingProjectOutputFolder = useUsingProjectOutputFolder()

async function droppedOutputFolder(items: DataTransferItemList) {
	let directoryHandle = null

	try {
		directoryHandle = await items[0].getAsFileSystemHandle()
	} catch {}

	if (!directoryHandle) return
	if (!(directoryHandle instanceof FileSystemDirectoryHandle)) return

	Settings.set('outputFolder', directoryHandle)
}

function clearOutputFolder() {
	Settings.set('outputFolder', undefined)
}
</script>

<template>
	<div class="w-full">
		<div class="w-full">
			<Warning v-if="!get('outputFolder')" text="You have no default output folder set!" class="mt-4 mb-4 ml-auto mr-auto" />

			<Info
				v-if="usingProjectOutputFolder"
				text="The default output folder is being overwritten by a project ouput folder."
				class="mt-4 mb-4 ml-auto mr-auto"
			/>

			<FileSystemDrop class="mb-8 h-48" :text="t('windows.settings.projects.outputFolder.description')" @drop="droppedOutputFolder" />
		</div>

		<TextButton @click="clearOutputFolder" :text="t('windows.settings.projects.clearOutputFolder.name')" class="mb-4" />
	</div>
</template>
