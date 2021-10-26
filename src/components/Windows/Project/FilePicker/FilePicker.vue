<template>
	<BaseWindow
		windowTitle="windows.openFile.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="true"
		:isFullscreen="false"
		:width="500"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			<v-autocomplete
				:label="t('windows.openFile.search')"
				v-model="selectedFile"
				:items="packFiles"
				dense
				:no-data-text="t('windows.openFile.noData')"
				outlined
				auto-select-first
				autofocus
				@change="onChange"
			>
				<template #item="{ item }">
					<v-icon class="mr-1" :color="getFileIconColor(item)">
						{{ getFileIcon(item) }}
					</v-icon>

					<span>{{ item }}</span>
				</template>
			</v-autocomplete>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { PackType } from '/@/components/Data/PackType'
import { App } from '/@/App.ts'

export default {
	name: 'OpenFileWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onChange(filePath) {
			if (filePath) this.currentWindow.openFile(filePath)
		},

		getFileIcon(filePath) {
			const fileType = App.fileType.getGlobal(filePath)
			if (!fileType) return 'mdi-file-outline'

			return fileType.icon || 'mdi-file-outline'
		},
		getFileIconColor(filePath) {
			const packType = PackType.get(filePath)
			if (!packType) return 'primary'

			return packType.color || 'primary'
		},
	},
}
</script>
