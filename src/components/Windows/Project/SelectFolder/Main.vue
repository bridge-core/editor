<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Select Folder"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="false"
		:isFullscreen="false"
		:isPersistent="true"
		:width="420"
		:height="100"
		@closeWindow="close"
	>
		<template #default>
			<p>
				Select where to save projects or choose an existing projects
				directory.
			</p>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="selectFolder">
				<v-icon class="pr-2">mdi-folder-outline</v-icon>
				<span>Select!</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/Base'

export default {
	name: 'SelectProjectFolderWindow',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],

	data() {
		return this.currentWindow.getState()
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		async selectFolder() {
			try {
				this.callback(
					await window.showDirectoryPicker({ mode: 'readwrite' })
				)
				this.close()
			} catch (e) {
				console.error(e)
			}
		},
	},
}
</script>

<style></style>
