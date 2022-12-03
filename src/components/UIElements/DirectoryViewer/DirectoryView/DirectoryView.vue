<template>
	<component
		:is="renderDirectoryName ? 'details' : 'div'"
		:open="directoryWrapper.isOpen.value"
		@dragenter="onDragEnter"
		@dragleave="onDragLeave"
		@drop="onDrop"
	>
		<Name
			v-if="renderDirectoryName"
			type="directory"
			tagName="summary"
			:baseWrapper="directoryWrapper"
		/>

		<!-- Render folder contents -->
		<Draggable
			v-if="directoryWrapper.isOpen.value"
			:class="{ [`ml-${folderIndentation}`]: renderDirectoryName }"
			v-model="directoryWrapper.children.value"
			group="directory-view"
			handle=".drag-handle"
			:disabled="isReadOnly || pointerDevice === 'touch'"
			@start="isDraggingWrapper = true"
			@end="isDraggingWrapper = false"
			@change="draggedHandle"
		>
			<template v-for="(entry, i) in directoryWrapper.children.value">
				<DirectoryView
					v-if="entry.kind === 'directory'"
					:directoryWrapper="entry"
					:key="`${i}//${entry.name}`"
				/>

				<FileView
					v-else-if="entry.kind === 'file'"
					:key="`${i}//${entry.name}`"
					:fileWrapper="entry"
				/>

				<!-- Error: unknown entry kind -->
				<div v-else :key="`${i}//${entry.name}`">
					<v-icon color="error" small>
						mdi-alert-circle-outline
					</v-icon>
					Unknown directory entry kind: "{{ entry.kind }}"
				</div>
			</template>
		</Draggable>
	</component>
</template>

<script>
import { DirectoryWrapper } from './DirectoryWrapper'
import FileView from '../FileView/FileView.vue'
import Draggable from 'vuedraggable'
import Name from '../Common/Name.vue'
import { clipboard } from '../ContextMenu/Actions/Edit/Copy'
import { PasteAction } from '../ContextMenu/Actions/Edit/Paste'
import { isDraggingWrapper } from '../Common/DraggingWrapper'
import { pointerDevice } from '/@/utils/pointerDevice'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export default {
	name: 'DirectoryView',
	components: { Draggable, FileView, Name },
	props: {
		directoryWrapper: DirectoryWrapper,
		renderDirectoryName: {
			default: true,
			type: Boolean,
		},
	},
	setup() {
		return {
			isDraggingWrapper,
			pointerDevice,
		}
	},
	data: () => ({
		selectedFromFileDrag: false,
		openedFromFileDrag: false,
	}),
	computed: {
		isReadOnly() {
			return this.directoryWrapper.options.isReadOnly
		},
		folderIndentation() {
			const defaultIndentation = 'normal'
			let indentationSetting =
				settingsState && settingsState.sidebar
					? settingsState.sidebar.packExplorerFolderIndentation
					: undefined
			if (!indentationSetting) indentationSetting = defaultIndentation

			// Turn the setting into a number
			switch (indentationSetting) {
				case 'small':
					return 1
				case 'normal':
					return 2
				case 'large':
					return 4
				case 'x-large':
					return 6
				default:
					throw new Error(
						`Invalid folder indentation setting: ${indentationSetting}`
					)
			}
		},
	},
	methods: {
		async onDragEnter(event) {
			if (this.isReadOnly || this.isDraggingWrapper) return

			event.preventDefault()
			event.stopPropagation()

			this.select(true)
			if (
				this.directoryWrapper.kind === 'directory' &&
				!this.directoryWrapper.isOpen.value
			) {
				this.openedFromFileDrag = true
				await this.directoryWrapper.open(true)
			}
		},
		async onDrop(event) {
			if (this.isReadOnly || this.isDraggingWrapper) return

			event.preventDefault()
			event.stopPropagation()

			this.isOpenedFromFileDrag = false
			this.selectedFromFileDrag = false

			const clipboardHandle = clipboard.item

			const dataTransferItems = [...(event.dataTransfer?.items ?? [])]
			if (dataTransferItems.length === 0) return

			event.preventDefault()
			event.stopPropagation()

			const pasteAction = PasteAction(this.directoryWrapper)
			for (const item of dataTransferItems) {
				const handle = await item.getAsFileSystemHandle()
				if (!handle) continue

				clipboard.item = handle
				await pasteAction.onTrigger()
			}

			await this.directoryWrapper.refresh()
			clipboard.item = clipboardHandle
		},
		onDragLeave(event) {
			if (this.isReadOnly || this.isDraggingWrapper) return

			event.preventDefault()
			event.stopPropagation()

			if (this.selectedFromFileDrag)
				this.directoryWrapper.isSelected.value = false
			this.selectedFromFileDrag = false

			if (this.openedFromFileDrag) this.directoryWrapper.close(false)
		},
		select(fromFileDrag = false) {
			if (fromFileDrag) this.selectedFromFileDrag = true
			else this.directoryWrapper.unselectAll()

			this.directoryWrapper.isSelected.value = true
		},
		draggedHandle(dragEvent) {
			// console.log(dragEvent)
			if (dragEvent.moved) {
				const { newIndex, oldIndex, element } = dragEvent.moved
				this.directoryWrapper.children.value.splice(newIndex, 1)
				this.directoryWrapper.children.value.splice(
					oldIndex,
					0,
					element
				)
			} else if (dragEvent.added) {
				const movedWrapper = dragEvent.added.element
				movedWrapper.move(this.directoryWrapper)
			}
		},
	},
}
</script>

<style scoped>
details[open] > summary > .open {
	display: inline;
}
details > summary > .open {
	display: none;
}
details[open] > summary > .closed {
	display: none;
}
details > summary > .closed {
	display: inline;
}
</style>
