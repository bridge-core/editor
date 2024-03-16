<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import File from './File.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { basename } from '@/libs/path'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { ActionManager } from '@/libs/actions/ActionManager'

const props = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})

const entries: Ref<BaseEntry[]> = ref([])

const expanded = ref(false)

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return

	if (!path.startsWith(props.path)) return

	if (!(await fileSystem.exists(props.path))) return

	entries.value = await fileSystem.readDirectoryEntries(props.path)
}

onMounted(async () => {
	fileSystem.eventSystem.on('pathUpdated', updateEntries)

	updateEntries(props.path)
})

onUnmounted(() => {
	fileSystem.eventSystem.off('pathUpdated', updateEntries)
})

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function executeContextMenuAction(action: string, data: any) {
	if (!contextMenu.value) return

	ActionManager.trigger(action, data)

	contextMenu.value.close()
}
</script>

<template>
	<div
		class="flex items-center gap-2 cursor-pointer hover:bg-background-tertiary transition-colors duration-100 ease-out"
		@click="expanded = !expanded"
		@contextmenu.prevent.stop="contextMenu?.open"
	>
		<Icon :icon="expanded ? 'folder_open' : 'folder'" :color="color" class="text-sm" />

		<span class="select-none font-inter"> {{ basename(path) }} </span>
	</div>

	<div class="ml-1 border-l pl-1 border-background-tertiary min-h-[1rem]" v-show="expanded">
		<div
			v-for="entry in entries.toSorted((a, b) => (a.type === 'file' ? 1 : 0) - (b.type === 'file' ? 1 : 0))"
			:key="entry.path"
		>
			<File :path="entry.path" :color="color" v-if="entry.type === 'file'" />
			<Directory :path="entry.path" :color="color" v-if="entry.type === 'directory'" />
		</div>
	</div>

	<FreeContextMenu ref="contextMenu">
		<ContextMenuItem
			icon="note_add"
			text="Create File"
			class="pt-4"
			@click.stop="executeContextMenuAction('createFile', path)"
		/>
		<ContextMenuItem
			icon="folder"
			text="Create Folder"
			@click.stop="executeContextMenuAction('createFolder', path)"
		/>
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
</template>
