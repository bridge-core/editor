<template>
	<component
		:is="renderDirectoryName ? 'details' : 'div'"
		:open="directoryWrapper.isOpen.value"
	>
		<summary
			v-if="renderDirectoryName"
			v-ripple
			tabindex="0"
			class="px-1 rounded-lg d-flex"
			:class="{ selected: directoryWrapper.isSelected.value }"
			@click.prevent="onClick"
			@click.right.prevent="directoryWrapper.onRightClick($event)"
			@focus="isFocused = true"
			@blur="isFocused = false"
		>
			<!-- Folder icon -->
			<v-icon class="pr-1" :color="directoryWrapper.color" small>
				{{
					directoryWrapper.isOpen.value
						? 'mdi-folder-open'
						: 'mdi-folder'
				}}
			</v-icon>

			<!-- Folder name -->
			<span
				:style="{
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',
				}"
			>
				{{ directoryWrapper.name }}
			</span>

			<v-spacer />

			<v-icon v-if="isFocused" :color="directoryWrapper.color">
				mdi-circle-small
			</v-icon>
		</summary>

		<!-- Render folder contents -->
		<Draggable
			v-if="directoryWrapper.isOpen.value"
			:class="{ 'ml-2': renderDirectoryName }"
			v-model="directoryWrapper.children.value"
			group="directory-view"
			:disabled="directoryWrapper.options.isReadonly"
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
import { platform } from '/@/utils/os'

export default {
	name: 'DirectoryView',
	components: { Draggable, FileView },
	props: {
		directoryWrapper: DirectoryWrapper,
		renderDirectoryName: {
			default: true,
			type: Boolean,
		},
	},
	data: () => ({
		isFocused: false,
	}),
	methods: {
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
		onClick(event) {
			this.directoryWrapper.toggleOpen()

			// Unselect other wrappers if multiselect key is not pressed
			if (
				(platform() === 'darwin' && !event.metaKey) ||
				(platform() !== 'darwin' && !event.ctrlKey)
			)
				this.directoryWrapper.unselectAll()
			this.directoryWrapper.isSelected.value = true

			// Find first summary and focus it
			const firstSummary = event.path.find(
				(el) => el.tagName === 'SUMMARY'
			)
			if (firstSummary) firstSummary.focus()
		},
	},
}
</script>

<style scoped>
summary {
	outline: none;
	cursor: pointer;
	display: block;
}
summary.selected {
	background: var(--v-background-base);
}

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
