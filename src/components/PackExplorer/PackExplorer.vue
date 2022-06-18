<template>
	<NoProjectView v-if="sidebarContent.showNoProjectView" />
	<FileDisplayer
		v-else-if="sidebarContent.selectedAction"
		:key="sidebarContent.selectedAction.config.id"
		:entry="
			sidebarContent.directoryEntries[
				sidebarContent.selectedAction.config.id
			]
		"
		@contextmenu="onContextMenu"
	/>
</template>

<script>
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import FileDisplayer from './FileDisplayer.vue'
import NoProjectView from './NoProjectView.vue'

export default {
	props: {
		sidebarContent: Object,
	},
	components: {
		FileDisplayer,
		NoProjectView,
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

<style></style>
