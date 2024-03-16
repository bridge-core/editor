<script setup lang="ts">
import File from './File.vue'
import Directory from './Directory.vue'
import Icon from '@/components/Common/Icon.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'

import { fileExplorer } from '@/App'
import { TabManager } from '@/components/TabSystem/TabManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { ComputedRef, Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { join } from '@/libs/path'
import { IPackType } from 'mc-project-core'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { useTranslate } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { ActionManager } from '@/libs/actions/ActionManager'
import { Windows } from '@/components/Windows/Windows'

const t = useTranslate()

const currentProject = ProjectManager.useCurrentProject()

const currentProjectPackDefinitions: Ref<IPackType[]> = computed(() => {
	if (!currentProject.value) return []
	if (!(currentProject.value instanceof BedrockProject)) return []

	return currentProject.value.packDefinitions.filter((pack: IPackType) => {
		if (!currentProject.value) return false
		if (!currentProject.value.config) return false

		return Object.keys(currentProject.value.config.packs).includes(pack.id)
	})
})

const selectedPack: Ref<string> = ref('')
const selectedPackDefinition: ComputedRef<IPackType | null> = computed(() => {
	if (!currentProject.value) return null
	if (!(currentProject.value instanceof BedrockProject)) return null

	return currentProject.value.packDefinitions.find((pack: IPackType) => pack.id === selectedPack.value) ?? null
})
const selectedPackPath: ComputedRef<string> = computed(() => {
	if (!currentProject.value) return ''
	if (!(currentProject.value instanceof BedrockProject)) return ''

	return join(
		currentProject.value.path,
		currentProject.value.packDefinitions.find((pack: IPackType) => pack.id === selectedPack.value)
			?.defaultPackPath ?? ''
	)
})

const entries: Ref<BaseEntry[]> = ref([])

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return
	if (!currentProject.value) return

	if (!path.startsWith(selectedPackPath.value)) return

	entries.value = await fileSystem.readDirectoryEntries(selectedPackPath.value)
}

watch(selectedPackPath, (path) => {
	updateEntries(path)
})

onMounted(async () => {
	fileSystem.eventSystem.on('pathUpdated', updateEntries)

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	selectedPack.value = currentProject.value.packDefinitions[0]?.id ?? ''

	updateEntries(selectedPackPath.value)
})

onUnmounted(() => {
	fileSystem.eventSystem.off('pathUpdated', updateEntries)
})

async function contextMenuBuild(close: any) {
	close()

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	await currentProject.value.build()
}

async function contextMenuNewFile(close: any) {
	close()

	Windows.open('presets')
}

async function contextMenuOpenProjectConfig(close: any) {
	close()

	TabManager.openFile(join(currentProject.value!.path, 'config.json'))
}

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function executeContextMenuAction(action: string, data: any) {
	if (!contextMenu.value) return

	ActionManager.trigger(action, data)

	contextMenu.value.close()
}
</script>

<template>
	<div class="w-96 h-full mt-2 flex flex-col gap-2" v-if="fileExplorer.open.value">
		<div class="bg-background-secondary rounded h-16 flex items-center p-3 gap-3">
			<img :src="currentProject?.icon ?? ''" class="w-10 h-10 select-none" />
			<p class="text-3xl select-none font-inter font-medium">
				{{ currentProject?.name }}
			</p>
		</div>

		<div class="bg-background-secondary rounded flex-1 p-2">
			<div class="flex gap-2 mb-2" v-if="currentProject">
				<button
					v-for="packDefinition in currentProjectPackDefinitions"
					class="flex-1 flex items-center justify-center p-2 rounded border-2 hover:border-accent transition-colors duration-100 ease-out"
					:class="{
						'bg-background border-background': packDefinition.id !== selectedPack,
						'bg-[var(--color)] border-[var(--color)]': packDefinition.id === selectedPack,
					}"
					:style="{
						'--color': `var(--theme-color-${packDefinition.color})`,
					}"
					@click="selectedPack = packDefinition.id"
				>
					<Icon
						:icon="packDefinition.icon"
						:color="packDefinition.id === selectedPack ? 'text' : packDefinition.color"
					/>
				</button>

				<ContextMenu class="flex-1 basis-5">
					<template #main="{ toggle }">
						<button
							@click="toggle"
							class="flex w-full h-full items-center justify-center p-2 rounded bg-background hover:bg-primary transition-colors duration-100 ease-out"
						>
							<Icon icon="more_vert" />
						</button>
					</template>

					<template #menu="{ close }">
						<div
							class="w-56 bg-background-secondary rounded mt-2 shadow-window overflow-hidden relative z-10"
						>
							<ContextMenuItem
								text="New File"
								icon="add"
								@click="() => contextMenuNewFile(close)"
								class="pt-4"
							/>
							<ContextMenuItem text="Build" icon="manufacturing" @click="() => contextMenuBuild(close)" />
							<ContextMenuItem
								text="Open Project Config"
								icon="settings"
								@click="() => contextMenuOpenProjectConfig(close)"
								class="pb-4"
							/>
						</div>
					</template>
				</ContextMenu>
			</div>

			<div class="h-full" @contextmenu.prevent="contextMenu?.open">
				<div
					v-for="entry in entries.toSorted(
						(a, b) => (a.type === 'file' ? 1 : 0) - (b.type === 'file' ? 1 : 0)
					)"
					:key="entry.path"
				>
					<File :path="entry.path" :color="selectedPackDefinition!.color" v-if="entry.type === 'file'" />
					<Directory
						:path="entry.path"
						:color="selectedPackDefinition!.color"
						v-if="entry.type === 'directory'"
					/>
				</div>
			</div>
		</div>
	</div>

	<FreeContextMenu ref="contextMenu">
		<ContextMenuItem
			icon="note_add"
			text="Create File"
			class="pt-4"
			@click.stop="executeContextMenuAction('createFile', selectedPackPath)"
		/>
		<ContextMenuItem
			icon="folder"
			text="Create Folder"
			@click.stop="executeContextMenuAction('createFolder', selectedPackPath)"
		/>
		<ContextMenuItem
			icon="content_paste"
			text="Paste"
			class="pb-4"
			@click.stop="executeContextMenuAction('pasteFileSystemEntry', selectedPackPath)"
		/>
	</FreeContextMenu>
</template>
