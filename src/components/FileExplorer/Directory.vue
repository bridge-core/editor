<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import File from './File.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'

import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { basename, dirname, join } from 'pathe'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { ActionManager } from '@/libs/actions/ActionManager'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { FileExplorer } from './FileExplorer'
import { Settings } from '@/libs/settings/Settings'

const get = Settings.useGet()

const props = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
	preview: {
		type: Boolean,
		default: false,
	},
})

const entries: Ref<BaseEntry[]> = ref([])
const orderedEntries = computed(() =>
	(FileExplorer.isItemDragging()
		? draggingOver.value && draggingLocation.value === 'inside'
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

const expanded = ref(false)

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return

	if (!path.startsWith(props.path)) return

	if (!(await fileSystem.exists(props.path))) return

	entries.value = await fileSystem.readDirectoryEntries(props.path)
}

let disposable: Disposable

onMounted(async () => {
	disposable = fileSystem.pathUpdated.on(updateEntries)

	updateEntries(props.path)
})

onUnmounted(() => {
	disposable.dispose()
})

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

const dragOverElement: Ref<HTMLDivElement> = <any>ref(null)
const dragOverElementContainer: Ref<HTMLDivElement> = <any>ref(null)
const draggingCount = ref(0)
const draggingOver = computed(() => draggingCount.value > 0)
const draggingLocation: Ref<'inside' | 'above' | 'below'> = ref('inside')
let expandTimeout: number | null = null

function dragStart() {
	requestAnimationFrame(() => {
		FileExplorer.draggedItem.value = { kind: 'directory', path: props.path }
	})
}

function dragEnd() {
	FileExplorer.draggedItem.value = null
}

function dragEnter(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	if (!FileExplorer.draggedItem.value) return

	if (draggingCount.value === 0) {
		expandTimeout = setTimeout(() => {
			expanded.value = true
			expandTimeout = null
		}, 200)
	}

	draggingCount.value++

	event.stopPropagation()
}

function dragLeave(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	if (!FileExplorer.draggedItem.value) return

	draggingCount.value--

	if (draggingCount.value === 0 && expandTimeout) {
		clearTimeout(expandTimeout)
	}

	event.stopPropagation()
}

function dragOver(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	if (!FileExplorer.draggedItem.value) return

	const y = event.clientY

	const boundingRect = dragOverElement.value.getBoundingClientRect()
	const minY = boundingRect.top
	const height = boundingRect.height

	const containerBoundingRect = dragOverElementContainer.value.getBoundingClientRect()
	const containerMinY = containerBoundingRect.top
	const cotnainerHeight = containerBoundingRect.height

	if (y < minY + height / 2) {
		draggingLocation.value = 'above'
	} else if (y > minY + height / 2 && y < containerMinY + cotnainerHeight - 20) {
		draggingLocation.value = 'inside'
	} else {
		draggingLocation.value = 'below'
	}
}

function drop(event: DragEvent) {
	if (props.preview) return

	draggingCount.value = 0

	event.stopPropagation()

	if (!FileExplorer.draggedItem.value) return

	if (draggingLocation.value === 'inside') {
		fileSystem.move(FileExplorer.draggedItem.value.path, join(props.path, basename(FileExplorer.draggedItem.value.path)))
	} else {
		fileSystem.move(FileExplorer.draggedItem.value.path, join(dirname(props.path), basename(FileExplorer.draggedItem.value.path)))
	}

	FileExplorer.draggedItem.value = null
}
</script>

<template>
	<div @dragenter="dragEnter" @dragleave="dragLeave" @dragover="dragOver" @drop="drop">
		<File
			v-if="FileExplorer.isItemDragging() && draggingOver && draggingLocation === 'above' && !preview && FileExplorer.draggedItem.value!.kind === 'file'"
			:path="FileExplorer.draggedItem.value!.path ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>

		<Directory
			v-if="FileExplorer.isItemDragging() && draggingOver && draggingLocation === 'above' && !preview && FileExplorer.draggedItem.value!.kind === 'directory'"
			:path="FileExplorer.draggedItem.value!.path ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>

		<div ref="dragOverElementContainer">
			<div
				class="flex items-center gap-2 cursor-pointer transition-colors duration-100 ease-out rounded pl-1"
				:class="{
					'hover:bg-background-tertiary': !FileExplorer.draggedItem.value,
				}"
				@click="expanded = !expanded"
				@contextmenu.prevent.stop="contextMenu?.open"
				@dragstart="dragStart"
				@dragend="dragEnd"
				:draggable="true"
				ref="dragOverElement"
			>
				<Icon :icon="expanded ? 'folder_open' : 'folder'" :color="color" class="text-sm" />

				<span class="select-none font-theme"> {{ basename(path) }} </span>
			</div>

			<div
				class="ml-1 border-l border-background-tertiary min-h-[1rem]"
				:class="{
					'pl-0.5': get('fileExplorerIndentation') === 'small',
					'pl-1': get('fileExplorerIndentation') === 'normal',
					'pl-3': get('fileExplorerIndentation') === 'large',
					'pl-6': get('fileExplorerIndentation') === 'x-large',
				}"
				v-if="expanded && entries.length > 0"
			>
				<div v-for="entry in orderedEntries" :key="entry.path">
					<File :path="entry.path" :color="color" v-if="entry.kind === 'file'" :preview="FileExplorer.draggedItem.value?.path === entry.path" />

					<Directory :path="entry.path" :color="color" v-if="entry.kind === 'directory'" :preview="FileExplorer.draggedItem.value?.path === entry.path" />
				</div>
			</div>
		</div>

		<File
			v-if="FileExplorer.isItemDragging() && draggingOver && draggingLocation === 'below' && !preview && FileExplorer.draggedItem.value!.kind === 'file'"
			:path="FileExplorer.draggedItem.value!.path ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>

		<Directory
			v-if="FileExplorer.isItemDragging() && draggingOver && draggingLocation === 'below' && !preview && FileExplorer.draggedItem.value!.kind === 'directory'"
			:path="FileExplorer.draggedItem.value!.path ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>

		<FreeContextMenu ref="contextMenu" v-slot="{ close }">
			<ActionContextMenuItem action="files.createFile" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.createFolder" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.renameFileSystemEntry" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.deleteFileSystemEntry" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.duplicateFilesystemEntry" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.copyFileSystemEntry" :data="() => path" @click.stop="close" />
			<ActionContextMenuItem action="files.pasteFileSystemEntry" :data="() => path" @click.stop="close" />
		</FreeContextMenu>
	</div>
</template>
