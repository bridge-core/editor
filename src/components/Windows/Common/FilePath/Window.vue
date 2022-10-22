<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="`[${t('windows.filePath.title')}${
			window.hasFilePath ? `: ${state.fileName}${window.fileExt}` : ''
		}]`"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="window.isPersistent"
		:hasCloseButton="false"
		:width="440"
		:height="170"
		@closeWindow="onClose(true)"
	>
		<template #default>
			<span v-if="window.hasFilePath" class="d-flex align-center">
				<v-text-field
					v-model="state.fileName"
					dense
					outlined
					prepend-icon="mdi-pencil-outline"
					:rules="[
						(value) =>
							!!value.match(/^[a-zA-Z0-9_\.]*$/) ||
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
				<span class="ml-3 mb-6">{{ window.fileExt }}</span>
			</span>

			<PresetPath v-model="state.currentFilePath" />
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

<script lang="ts" setup>
import PresetPath from '/@/components/Windows/Project/CreatePreset/PresetPath.vue'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { useTranslations } from '/@/components/Composables/useTranslations'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onClose(skippedDialog: boolean) {
	props.window.startCloseWindow(skippedDialog)
}
</script>
