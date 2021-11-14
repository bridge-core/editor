<template>
	<div
		class="font-weight-black clickable px-1"
		style="display: inline-block; width: fit-content"
		v-ripple
		@click="openFile(filePath)"
	>
		<v-icon
			style="position: relative; top: -2px"
			small
			:color="getIconColor(filePath)"
		>
			{{ getFileIcon(filePath) }}
		</v-icon>
		{{ relFilePath }}
	</div>
</template>

<script>
import { App } from '/@/App.ts'

export default {
	name: 'FileName',
	props: {
		filePath: String,
	},
	methods: {
		getFileIcon(filePath) {
			return (App.fileType.get(filePath) || {}).icon ?? 'mdi-file-outline'
		},
		getIconColor(filePath) {
			return (App.packType.get(filePath) || {}).color
		},
		async openFile(filePath) {
			const app = await App.getApp()

			const fileHandle = await app.fileSystem.getFileHandle(filePath)
			app.project.openFile(fileHandle)
		},
	},
	computed: {
		relFilePath() {
			return App.instance.project.relativePath(this.filePath)
		},
	},
}
</script>

<style></style>
