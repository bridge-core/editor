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
		{{ filePath }}
	</div>
</template>

<script>
import { App } from '/@/App.ts'
import { FileType } from '/@/components/Data/FileType.ts'
import { PackType } from '/@/components/Data/PackType.ts'

export default {
	name: 'FileName',
	props: {
		filePath: String,
	},
	methods: {
		getFileIcon(filePath) {
			return (FileType.get(filePath) || {}).icon ?? 'mdi-file-outline'
		},
		getIconColor(filePath) {
			return (PackType.getWithRelativePath(filePath) || {}).color
		},
		async openFile(filePath) {
			const app = await App.getApp()

			const fileHandle = await app.fileSystem.getFileHandle(
				`projects/${app.project.name}/${filePath}`
			)
			app.project.openFile(fileHandle)
		},
	},
}
</script>

<style></style>
