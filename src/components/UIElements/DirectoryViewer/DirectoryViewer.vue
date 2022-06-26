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
import { ref } from '@vue/composition-api'
import { DirectoryStore } from './DirectoryStore'
import DirectoryView from './DirectoryView.vue'
import { DirectoryWrapper } from './DirectoryWrapper'

export default {
	components: { DirectoryView },
	props: {
		directoryHandle: [FileSystemDirectoryHandle, DirectoryWrapper],
		renderTopLevelDirectory: Boolean,
	},
	setup(props) {
		const directoryWrapper = ref(null)

		if (props.directoryHandle instanceof DirectoryWrapper) {
			directoryWrapper.value = props.directoryHandle
		} else {
			DirectoryStore.getDirectory(props.directoryHandle).then(
				(wrapper) => {
					directoryWrapper.value = wrapper
				}
			)
		}

		return {
			directoryWrapper,
		}
	},
}
</script>
