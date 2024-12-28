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

function dragStart() {
	requestAnimationFrame(() => {
		FileExplorer.draggedItem.value = { kind: 'file', path: props.path }
	})
}

function dragEnd() {
	FileExplorer.draggedItem.value = null
}
</script>

<template>
	<div
		v-show="FileExplorer.draggedItem.value?.path !== path || preview"
		class="flex items-center gap-2 cursor-pointer transition-colors duration-100 ease-out rounded pl-1"
		:class="{
			'hover:bg-background-tertiary': !FileExplorer.draggedItem.value,
		}"
		@click="click"
		@contextmenu.prevent.stop="contextMenu?.open"
		@dragstart="dragStart"
		@dragend="dragEnd"
		draggable="true"
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
