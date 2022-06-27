<template>
	<component
		:is="renderDirectoryName ? 'details' : 'div'"
		:open="directoryWrapper.isOpen.value"
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
			:disabled="directoryWrapper.options.isReadOnly"
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
