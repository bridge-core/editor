<template>
	<div class="my-1">
		<DirectoryViewer
			v-if="sidebarContent.selectedAction"
			class="mb-2"
			:key="sidebarContent.selectedAction.config.id"
			:directoryHandle="
				sidebarContent.directoryEntries[
					sidebarContent.selectedAction.config.id
				]
			"
			:options="{
				defaultIconColor: sidebarContent.selectedAction.config.color,
			}"
		/>
	</div>
</template>

<script>
import DirectoryViewer from '/@/components/UIElements/DirectoryViewer/DirectoryViewer.vue'

export default {
	props: {
		sidebarContent: Object,
	},
	components: {
		DirectoryViewer,
	},
}
</script>
