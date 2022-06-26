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
				:items="processedFiles"
				:cache-items="false"
				dense
				:no-data-text="t('windows.openFile.noData')"
				:menu-props="{
					rounded: 'lg',
					dense: true,
					'nudge-top': -8,
					transition: 'slide-y-transition',
				}"
				:filter="filter"
				outlined
				auto-select-first
				autofocus
				@change="onChange"
				@update:search-input="onUpdateSearchInput"
			>
				<template #item="{ item: { value, text } }">
					<v-icon class="mr-1" :color="getFileIconColor(value)">
						{{ getFileIcon(value) }}
					</v-icon>

					<span>{{ text }}</span>
				</template>
			</v-autocomplete>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
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
			const fileType = App.fileType.get(filePath)
			if (!fileType) return 'mdi-file-outline'

			return fileType.icon || 'mdi-file-outline'
		},
		getFileIconColor(filePath) {
			const packType = App.packType.get(filePath)
			if (!packType) return 'primary'

			return packType.color || 'primary'
		},
		filter() {
			return 1
		},
		onUpdateSearchInput(searchInput) {
			if (searchInput === null) searchInput = ''

			this.processedFiles = this.quickScore
				.search(searchInput)
				.map(({ item }) => item)
		},
	},
}
</script>
