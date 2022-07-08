<template>
	<div class="my-1">
		<DirectoryViewer
			v-for="(
				{ directoryHandle, startPath, defaultIconColor }, i
			) in sidebarContent.directoryHandles"
			class="mb-2"
			:key="i"
			:directoryHandle="directoryHandle"
			:renderTopLevelDirectory="true"
			:options="{
				startPath,
				defaultIconColor,
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
