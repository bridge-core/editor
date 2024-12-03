<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'

import { TabManager } from '@/components/TabSystem/TabManager'
import { basename } from 'pathe'
import { ref, Ref } from 'vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { FileExplorer } from './FileExplorer'

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function click() {
	TabManager.openFile(path)
}

const { path } = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})

function executeContextMenuAction(action: string, data: any) {
	if (!contextMenu.value) return

	ActionManager.trigger(action, data)

	contextMenu.value.close()
}

function dragStart() {
	requestAnimationFrame(() => {
		FileExplorer.draggedItem.value = path
	})
}

function dragEnd() {
	FileExplorer.draggedItem.value = null
}

function drop() {}
</script>

<template>
	<div
		v-show="FileExplorer.draggedItem.value !== path"
		class="flex items-center gap-2 cursor-pointer hover:bg-background-tertiary transition-colors duration-100 ease-out rounded pl-1"
		@click="click"
		draggable="true"
		@drag=""
		@dragstart="dragStart"
		@dragend="dragEnd"
		@drop="drop"
		@contextmenu.prevent.stop="contextMenu?.open"
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
</template>
