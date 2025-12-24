<script setup lang="ts">
import Warning from '@/components/Common/Warning.vue'
import TextButton from '@/components/Common/TextButton.vue'
import Info from '@/components/Common/Info.vue'

import { Settings } from '@/libs/settings/Settings'
import { useTranslate } from '@/libs/locales/Locales'
import { useUsingProjectOutputFolder } from '@/libs/project/ProjectManager'
import { pickDirectory } from '@/libs/fileSystem/FileSystem'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'

const t = useTranslate()

defineProps(['item'])

const get = Settings.useGet()
const usingProjectOutputFolder = useUsingProjectOutputFolder()

async function selectOutputFolder() {
	if (!tauriBuild) return

	const directory = await pickDirectory()

	if (!(directory instanceof TauriFileSystem)) return

	Settings.set('outputFolder', { type: 'tauri', path: directory.basePath })
}

function clearOutputFolder() {
	if (!Settings.get('outputFolder')) return

	Settings.set('outputFolder', undefined)
}
</script>

<template>
	<div class="w-full">
		<div v-if="!tauriBuild">
			<Warning :text="t('windows.settings.projects.outputFolder.warning.notSupported')" class="mt-4 mb-4 mr-auto" />
		</div>

		<div v-else>
			<Warning
				v-if="!get('outputFolder')"
				:text="t('windows.settings.projects.outputFolder.warning.notSet')"
				class="mt-4 mb-4 mr-auto"
			/>

			<Info
				v-if="usingProjectOutputFolder"
				:text="t('windows.settings.projects.outputFolder.warning.overwritten')"
				class="mt-4 mb-4 mr-auto"
			/>
		</div>

		<div class="flex mb-4">
			<TextButton :text="t('windows.settings.projects.outputFolder.button')" @click="selectOutputFolder" :enabled="tauriBuild" />

			<p class="text-text-secondary ml-4 self-center max-w-96">{{ t('windows.settings.projects.outputFolder.description') }}</p>
		</div>

		<div class="flex mb-4">
			<TextButton
				@click="clearOutputFolder"
				:text="t('windows.settings.projects.clearOutputFolder.name')"
				class="block"
				:enabled="!!get('outputFolder')"
			/>

			<p class="text-text-secondary ml-4 self-center max-w-96">{{ t('windows.settings.projects.clearOutputFolder.description') }}</p>
		</div>
	</div>
</template>
