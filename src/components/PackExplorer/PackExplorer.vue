<template>
	<HomeView v-if="sidebarContent.showNoProjectView" />

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
import HomeView from './HomeView/HomeView.vue'
import DirectoryViewer from '/@/components/UIElements/DirectoryViewer/DirectoryViewer.vue'

export default {
	props: {
		sidebarContent: Object,
	},
	components: {
		HomeView,
		DirectoryViewer,
	},
}
</script>
