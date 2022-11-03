<template>
	<div
		class="font-weight-black clickable px-1"
		style="display: inline-block; width: fit-content"
		v-ripple
		@click="openFile"
	>
		<v-icon
			style="position: relative; top: -2px"
			small
			:color="getIconColor(filePath)"
		>
			{{ getFileIcon(filePath) }}
		</v-icon>
		{{ displayFilePath }}
	</div>
</template>

<script>
import { App } from '/@/App.ts'

export default {
	name: 'FileName',
	props: {
		displayFilePath: String,
		filePath: String,
		fileHandle: {},
	},
	methods: {
		getFileIcon(filePath) {
			return (App.fileType.get(filePath) || {}).icon ?? 'mdi-file-outline'
		},
		getIconColor(filePath) {
			return (App.packType.get(filePath) || {}).color
		},
		async openFile() {
			const app = await App.getApp()

			app.project.openFile(this.fileHandle)
		},
	},
}
</script>

<style></style>
