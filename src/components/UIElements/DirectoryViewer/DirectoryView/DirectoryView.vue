<template>
	<component
		:is="renderDirectoryName ? 'details' : 'div'"
		:open="directoryWrapper.isOpen.value"
		@dragenter.stop="onDragEnter"
		@dragleave.stop="onDragLeave"
		@drop.stop.prevent="onDrop"
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
			:class="{ 'ml-2': renderDirectoryName }"
			v-model="directoryWrapper.children.value"
			group="directory-view"
			:disabled="isReadOnly"
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
import { clipboard } from '../ContextMenu/Actions/Copy'
import { PasteAction } from '../ContextMenu/Actions/Paste'

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
	data: () => ({
		selectedFromFileDrag: false,
		openedFromFileDrag: false,
	}),
	computed: {
		isReadOnly() {
			return this.directoryWrapper.options.isReadOnly
		},
	},
	methods: {
		async onDragEnter(event) {
			if (this.isReadOnly) return

			event.preventDefault()

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
			if (this.isReadOnly) return

			this.isOpenedFromFileDrag = false
			this.selectedFromFileDrag = false

			const clipboardHandle = clipboard.item

			const dataTransferItems = [...(event.dataTransfer?.items ?? [])]
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
		onDragLeave() {
			if (this.isReadOnly) return

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
