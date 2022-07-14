<template>
	<NoProjectView v-if="sidebarContent.showNoProjectView" />

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
import NoProjectView from './NoProjectView/NoProjectView.vue'
import DirectoryViewer from '/@/components/UIElements/DirectoryViewer/DirectoryViewer.vue'

export default {
	props: {
		sidebarContent: Object,
	},
	components: {
		NoProjectView,
		DirectoryViewer,
	},
}
</script>
