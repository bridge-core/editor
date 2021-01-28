<template>
	<BaseWindow
		windowTitle="windows.openFile.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="true"
		:isFullscreen="false"
		:width="460"
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
				autofocus
				auto-select-first
				@change="onChange"
			/>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '@/utils/locales'

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
	},
}
</script>
