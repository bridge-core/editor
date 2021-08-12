<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.filePath.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="$data.isPersistent"
		:hasCloseButton="false"
		:width="440"
		:height="140"
		@closeWindow="onClose(true)"
	>
		<template #default>
			<PresetPath v-model="currentFilePath" />
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="onClose(false)">
				<v-icon>mdi-check</v-icon>
				<span> {{ t('general.confirm') }} </span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import PresetPath from '/@/components/Windows/Project/CreatePreset/PresetPath.vue'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'FilePathWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		PresetPath,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose(skippedDialog) {
			this.currentWindow.close(
				skippedDialog ? null : this.currentFilePath
			)
		},
	},
}
</script>
