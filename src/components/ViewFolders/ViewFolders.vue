<template>
	<div class="my-1">
		<DirectoryViewer
			v-for="(
				{ handle, startPath }, i
			) in sidebarContent.directoryHandles"
			class="mb-2"
			:key="i"
			:directoryHandle="handle"
			:renderTopLevelDirectory="true"
			:options="{
				startPath,
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
