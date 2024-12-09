<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'

import { TabManager } from '@/components/TabSystem/TabManager'
import { basename, dirname, join } from 'pathe'
import { computed, ref, Ref } from 'vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { FileExplorer } from './FileExplorer'
import { fileSystem } from '@/libs/fileSystem/FileSystem'

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function click() {
	TabManager.openFile(props.path)
}

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

function executeContextMenuAction(action: string, data: any) {
	if (!contextMenu.value) return

	ActionManager.trigger(action, data)

	contextMenu.value.close()
}

const dragOverElement: Ref<HTMLDivElement> = <any>ref(null)

const draggingCount = ref(0)
const draggingOver = computed(() => draggingCount.value > 0)
const draggingAbove = ref(true)

function dragStart() {
	requestAnimationFrame(() => {
		FileExplorer.draggedItem.value = props.path
	})
}

function dragEnd() {
	FileExplorer.draggedItem.value = null
}

function dragEnter(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	if (!FileExplorer.draggedItem.value) return

	draggingCount.value++

	event.stopPropagation()
}

function dragLeave(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	if (!FileExplorer.draggedItem.value) return

	draggingCount.value--

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

	draggingAbove.value = y < minY + height / 2
}

function drop(event: DragEvent) {
	if (props.preview) return

	draggingCount.value = 0

	event.stopPropagation()

	if (!FileExplorer.draggedItem.value) return

	fileSystem.move(FileExplorer.draggedItem.value, join(dirname(props.path), basename(FileExplorer.draggedItem.value)))

	FileExplorer.draggedItem.value = null
}
</script>

<template>
	<div
		draggable="true"
		@drag=""
		@dragstart="dragStart"
		@dragend="dragEnd"
		@dragenter="dragEnter"
		@dragleave="dragLeave"
		@dragover="dragOver"
		@drop="drop"
	>
		<File
			v-if="FileExplorer.draggedItem.value !== null && draggingOver && draggingAbove && !preview"
			:path="FileExplorer.draggedItem.value ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>

		<div
			v-show="FileExplorer.draggedItem.value !== path || preview"
			class="flex items-center gap-2 cursor-pointer hover:bg-background-tertiary transition-colors duration-100 ease-out rounded pl-1"
			@click="click"
			@contextmenu.prevent.stop="contextMenu?.open"
			ref="dragOverElement"
		>
			<Icon icon="draft" :color="color" class="text-sm" />

			<span class="select-none font-theme"> {{ basename(path) }} </span>

			<FreeContextMenu ref="contextMenu">
				<ContextMenuItem
					icon="edit"
					text="Rename"
					@click.stop="executeContextMenuAction('renameFileSystemEntry', path)"
				/>
				<ContextMenuItem
					icon="delete"
					text="Delete"
					@click.stop="executeContextMenuAction('deleteFileSystemEntry', path)"
				/>
				<ContextMenuItem
					icon="folder_copy"
					text="Duplicate"
					@click.stop="executeContextMenuAction('duplicateFileSystemEntry', path)"
				/>
				<ContextMenuItem
					icon="content_copy"
					text="Copy"
					@click.stop="executeContextMenuAction('copyFileSystemEntry', path)"
				/>
				<ContextMenuItem
					icon="content_paste"
					text="Paste"
					class="pb-4"
					@click.stop="executeContextMenuAction('pasteFileSystemEntry', path)"
				/>
			</FreeContextMenu>
		</div>

		<File
			v-if="FileExplorer.draggedItem.value !== null && draggingOver && !draggingAbove && !preview"
			:path="FileExplorer.draggedItem.value ?? 'Error: No path dragged!'"
			:color="color"
			:preview="true"
		/>
	</div>
</template>
