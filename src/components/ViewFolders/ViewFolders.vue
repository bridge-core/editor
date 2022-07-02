<template>
	<div class="my-1">
		<DirectoryViewer
			v-for="(dirHandle, i) in sidebarContent.directoryHandles"
			:key="i"
			:directoryHandle="dirHandle"
			:renderTopLevelDirectory="true"
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
