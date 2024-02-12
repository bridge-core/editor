<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'

import { tabManager } from '@/App'
import { basename } from '@/libs/path'
import { ref, Ref } from 'vue'
import { Actions } from '@/libs/actions/Actions'

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function click() {
	tabManager.openFile(path)
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

	Actions.trigger(action, data)

	contextMenu.value.close()
}
</script>

<template>
	<div class="flex items-center gap-2" @click="click" @contextmenu.prevent="contextMenu?.open">
		<Icon icon="draft" :color="color" class="text-sm" />

		<span class="select-none font-inter"> {{ basename(path) }} </span>

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
				text="Pase"
				class="pb-4"
				@click.stop="executeContextMenuAction('pasteFileSystemEntry', path)"
			/>
		</FreeContextMenu>
	</div>
</template>
