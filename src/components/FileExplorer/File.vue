<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'
import SubMenu from '@/components/Common/SubMenu.vue'
import ContextMenuDivider from '@/components/Common/ContextMenuDivider.vue'

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
			<ActionContextMenuItem action="files.renameFileSystemEntry" :data="() => path" @click="close" />
			<ActionContextMenuItem action="files.deleteFileSystemEntry" :data="() => path" @click="close" />
			<ActionContextMenuItem action="files.duplicateFileSystemEntry" :data="() => path" @click="close" />
			<ActionContextMenuItem action="files.copyFileSystemEntry" :data="() => path" @click="close" />
			<ActionContextMenuItem action="files.pasteFileSystemEntry" :data="() => path" @click="close" />

			<ContextMenuDivider v-if="fileActions.length > 0" />

			<SubMenu v-if="fileActions.length > 0">
				<template #main="slotProps">
					<ContextMenuItem icon="more_horiz" text="actions.more" @mouseenter="slotProps.show" @mouseleave="slotProps.hide" />
				</template>

				<template #menu="">
					<ActionContextMenuItem
						v-for="action in fileActions"
						:action="action"
						@click="
							() => {
								ActionManager.trigger(action, path)

								close()
							}
						"
					/>
				</template>
			</SubMenu>
		</FreeContextMenu>
	</div>
</template>
