<template>
	<NoProjectView v-if="sidebarContent.showNoProjectView" />
	<!-- <FileDisplayer
		v-else-if="sidebarContent.selectedAction"
		:key="sidebarContent.selectedAction.config.id"
		:entry="
			sidebarContent.directoryEntries[
				sidebarContent.selectedAction.config.id
			]
		"
		@contextmenu="onContextMenu"
	/> -->
	<DirectoryViewer
		v-else-if="sidebarContent.selectedAction"
		:key="sidebarContent.selectedAction.config.id"
		:directoryHandle="
			sidebarContent.directoryEntries[
				sidebarContent.selectedAction.config.id
			]
		"
	/>
</template>

<script>
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import FileDisplayer from './FileDisplayer.vue'
import NoProjectView from './NoProjectView/NoProjectView.vue'
import DirectoryViewer from '/@/components/UIElements/DirectoryViewer/DirectoryViewer.vue'

export default {
	props: {
		sidebarContent: Object,
	},
	components: {
		FileDisplayer,
		NoProjectView,
		DirectoryViewer,
	},
	methods: {
		async onContextMenu(data) {
			showContextMenu(
				data,
				await this.sidebarContent.getContextMenu(
					data.type,
					data.path,
					data.entry
				)
			)
		},
	},
}
</script>
