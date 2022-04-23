<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="`[${t('windows.filePath.title')}${
			this.hasFilePath ? `: ${this.fileName}${this.fileExt}` : ''
		}]`"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="$data.isPersistent"
		:hasCloseButton="false"
		:width="440"
		:height="170"
		@closeWindow="onClose(true)"
	>
		<template #default>
			<span v-if="hasFilePath" class="d-flex align-center">
				<v-text-field
					v-model="fileName"
					dense
					outlined
					prepend-icon="mdi-pencil-outline"
					:rules="[
						(value) =>
							value.match(/^[a-zA-Z0-9_\.]*$/) ||
							t(
								'windows.createPreset.validationRule.alphanumeric'
							),
						(value) =>
							!!value ||
							t('windows.createPreset.validationRule.required'),
						(value) =>
							value.toLowerCase() === value ||
							t('windows.createPreset.validationRule.lowercase'),
					]"
				/>
				<span class="ml-3 mb-6">{{ fileExt }}</span>
			</span>

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
			this.currentWindow.startCloseWindow(skippedDialog)
		},
	},
}
</script>
