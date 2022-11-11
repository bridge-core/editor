<template>
	<v-progress-linear v-if="!directoryWrapper" indeterminate />
	<DirectoryView
		v-else
		class="mx-1"
		:directoryWrapper="directoryWrapper"
		:renderDirectoryName="renderTopLevelDirectory"
	/>
</template>

<script>
import { ref } from 'vue'
import { DirectoryStore } from './DirectoryStore'
import DirectoryView from './DirectoryView/DirectoryView.vue'
import { DirectoryWrapper } from './DirectoryView/DirectoryWrapper'

export default {
	components: { DirectoryView },
	props: {
		// Cannot  use "FileSystemDirectoryViewer" here because reference doesn't exist on Safari
		directoryHandle: { required: true },
		renderTopLevelDirectory: Boolean,
		options: Object,
	},
	setup(props) {
		const directoryWrapper = ref(null)

		if (props.directoryHandle instanceof DirectoryWrapper) {
			directoryWrapper.value = props.directoryHandle
		} else {
			DirectoryStore.getDirectory(
				props.directoryHandle,
				props.options
			).then((wrapper) => {
				directoryWrapper.value = wrapper
			})
		}

		return {
			directoryWrapper,
		}
	},
}
</script>
