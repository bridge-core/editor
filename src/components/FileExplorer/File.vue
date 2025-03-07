<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'
import SubMenu from '@/components/Common/SubMenu.vue'

import { TabManager } from '@/components/TabSystem/TabManager'
import { basename } from 'pathe'
import { onMounted, ref, Ref, ShallowRef, shallowRef } from 'vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { FileExplorer } from './FileExplorer'
import { useFileActions } from '@/libs/actions/file/FileActionManager'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'

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

let fileActions: ShallowRef<string[]> = shallowRef([])

onMounted(() => {
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	fileActions = useFileActions(ProjectManager.currentProject.fileTypeData.get(props.path)?.id)
})
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

		<span class="select-none font-theme text-ellipsis overflow-hidden"> {{ basename(path) }} </span>

		<FreeContextMenu ref="contextMenu" v-slot="{ close }">
			<ContextMenuItem icon="edit" text="Rename" @click.stop="executeContextMenuAction('renameFileSystemEntry', path)" />
			<ContextMenuItem icon="delete" text="Delete" @click.stop="executeContextMenuAction('deleteFileSystemEntry', path)" />
			<ContextMenuItem icon="folder_copy" text="Duplicate" @click.stop="executeContextMenuAction('duplicateFileSystemEntry', path)" />
			<ContextMenuItem icon="content_copy" text="Copy" @click.stop="executeContextMenuAction('copyFileSystemEntry', path)" />
			<ContextMenuItem icon="content_paste" text="Paste" class="pb-4" @click.stop="executeContextMenuAction('pasteFileSystemEntry', path)" />

			<div v-if="fileActions.length > 0" class="bg-background-tertiary w-full h-[2px] my-1"></div>

			<SubMenu v-if="fileActions.length > 0">
				<template #main="slotProps">
					<ContextMenuItem icon="more_horiz" text="general.more" @mouseenter="slotProps.show" @mouseleave="slotProps.hide" />
				</template>

				<template #menu="">
					<ActionContextMenuItem
						v-for="(action, index) in fileActions"
						:class="{ 'pt-4': index === 0, 'pb-4': index === fileActions.length - 1 }"
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
		</FreeContextMenu>
	</div>
</template>
