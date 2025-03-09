<script setup lang="ts">
import File from './File.vue'
import Directory from './Directory.vue'
import Icon from '@/components/Common/Icon.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import SubMenu from '@/components/Common/SubMenu.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'

import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { TabManager } from '@/components/TabSystem/TabManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { ComputedRef, Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { basename, join } from 'pathe'
import { IPackType } from 'mc-project-core'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { useCurrentProject } from '@/libs/project/ProjectManager'
import { ActionManager } from '@/libs/actions/ActionManager'
import { Windows } from '@/components/Windows/Windows'
import { PresetsWindow } from '@/components/Windows/Presets/PresetsWindow'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Settings } from '@/libs/settings/Settings'
import { useIsMobile } from '@/libs/Mobile'
import { useExportActions } from '@/libs/actions/export/ExportActionManager'

const get = Settings.useGet()
const isMobile = useIsMobile()

const currentProject = useCurrentProject()

const exportActions = useExportActions()

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

	return (
		currentProject.value.packs[selectedPack.value] ??
		join(currentProject.value.path, currentProject.value.packDefinitions.find((pack: IPackType) => pack.id === selectedPack.value)?.defaultPackPath ?? '')
	)
})

const entries: Ref<BaseEntry[]> = ref([])
const orderedEntries = computed(() =>
	(FileExplorer.isItemDragging()
		? draggingOver.value
			? [...entries.value.filter((entry) => entry.path !== FileExplorer.draggedItem.value!.path), FileExplorer.draggedItem.value!]
			: entries.value.filter((entry) => entry.path !== FileExplorer.draggedItem.value!.path)
		: entries.value
	)
		.toSorted((a, b) => {
			if (basename(a.path) < basename(b.path)) return -1
			if (basename(a.path) > basename(b.path)) return 1
			return 0
		})
		.toSorted((a, b) => (a.kind === 'file' ? 1 : -1) - (b.kind === 'file' ? 1 : -1))
)

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return
	if (!currentProject.value) return

	if (!path.startsWith(selectedPackPath.value)) return

	entries.value = await fileSystem.readDirectoryEntries(selectedPackPath.value)
}

watch(selectedPackPath, (path) => {
	updateEntries(path)
})

let disposable: Disposable

onMounted(async () => {
	disposable = fileSystem.pathUpdated.on(updateEntries)

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	selectedPack.value = Object.keys(currentProject.value.packs)[0] ?? ''

	updateEntries(selectedPackPath.value)
})

onUnmounted(() => {
	disposable.dispose()
})

async function contextMenuBuild(close: any) {
	close()

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	await currentProject.value.build()
}

async function contextMenuNewFile(close: any) {
	close()

	Windows.open(PresetsWindow)
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

const draggingCount = ref(0)
const draggingOver = computed(() => draggingCount.value > 0)

function dragEnter(event: DragEvent) {
	event.preventDefault()

	if (!FileExplorer.draggedItem.value) return

	draggingCount.value++

	event.stopPropagation()
}

function dragLeave(event: DragEvent) {
	event.preventDefault()

	if (!FileExplorer.draggedItem.value) return

	draggingCount.value--

	event.stopPropagation()
}

function drop(event: DragEvent) {
	draggingCount.value = 0

	event.stopPropagation()

	if (!FileExplorer.draggedItem.value) return

	fileSystem.move(FileExplorer.draggedItem.value.path, join(selectedPackPath.value, basename(FileExplorer.draggedItem.value.path)))

	FileExplorer.draggedItem.value = null
}
</script>

<template>
	<div
		class="h-full mt-2 flex flex-col gap-2 flex-1"
		:class="{
			'max-w-[14rem]': get('sidebarSize') === 'small' && !isMobile,
			'max-w-[18rem]': get('sidebarSize') === 'normal' && !isMobile,
			'max-w-[22rem]': get('sidebarSize') === 'large' && !isMobile,
			'max-w-[28rem]': get('sidebarSize') === 'x-large' && !isMobile,
		}"
		v-if="FileExplorer.open.value"
	>
		<div class="bg-background-secondary rounded h-16 flex items-center p-3 gap-3">
			<img :src="currentProject?.icon ?? ''" class="w-10 h-10 select-none" />
			<p class="text-3xl select-none font-theme font-medium truncate">
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
					<Icon :icon="packDefinition.icon" :color="packDefinition.id === selectedPack ? 'text' : packDefinition.color" />
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
						<div class="bg-background-secondary rounded mt-2 shadow-window relative z-10">
							<ContextMenuItem text="New File" icon="add" @click="() => contextMenuNewFile(close)" />
							<ContextMenuItem text="Build" icon="manufacturing" @click="() => contextMenuBuild(close)" />

							<div class="bg-background-tertiary w-full h-[2px] my-1"></div>

							<SubMenu>
								<template #main="slotProps">
									<ContextMenuItem icon="ios_share" text="Export As" @mouseenter="slotProps.show" @mouseleave="slotProps.hide" />
								</template>

								<template #menu="">
									<ActionContextMenuItem
										v-for="action in exportActions"
										:action="action"
										@click="
											() => {
												ActionManager.trigger(action)
												close()
											}
										"
									/>
								</template>
							</SubMenu>

							<div class="bg-background-tertiary w-full h-[2px] my-1"></div>

							<ContextMenuItem text="Open Project Config" icon="settings" @click="() => contextMenuOpenProjectConfig(close)" />
						</div>
					</template>
				</ContextMenu>
			</div>

			<div class="h-full" @contextmenu.prevent="contextMenu?.open" @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop">
				<div v-for="entry in orderedEntries" :key="entry.path">
					<File v-if="entry.kind === 'file'" :path="entry.path" :color="selectedPackDefinition!.color" :preview="FileExplorer.draggedItem.value?.path === entry.path" />

					<Directory
						v-if="entry.kind === 'directory'"
						:path="entry.path"
						:color="selectedPackDefinition!.color"
						:preview="FileExplorer.draggedItem.value?.path === entry.path"
					/>
				</div>
			</div>
		</div>
	</div>

	<FreeContextMenu ref="contextMenu" v-slot="{ close }">
		<ActionContextMenuItem action="files.createFile" :data="() => selectedPackPath" @click="close" />
		<ActionContextMenuItem action="files.createFolder" :data="() => selectedPackPath" @click="close" />
		<ActionContextMenuItem action="files.pasteFileSystemEntry" :data="() => selectedPackPath" @click="close" />
	</FreeContextMenu>
</template>
