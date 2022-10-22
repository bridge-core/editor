<template>
	<BaseWindow
		v-if="state.shouldRender"
		windowTitle="windows.assetPreview.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="false"
		:hasCloseButton="true"
		:width="760"
		:height="560"
		@closeWindow="onClose(true)"
	>
		<template #default>
			<div class="d-flex">
				<div style="width: 200px">
					<v-text-field
						v-model="state.assetName"
						outlined
						dense
						:label="t('windows.assetPreview.assetName')"
					/>

					<v-slider
						v-model="state.previewScale"
						min="1"
						max="4"
						step="0.1"
						discrete
						:thumb-size="24"
						thumb-label="always"
						hide-details
						:label="t('windows.assetPreview.previewScale')"
					/>
					<v-slider
						v-model="state.outputResolution"
						min="1"
						max="10"
						step="1"
						discrete
						:thumb-size="24"
						thumb-label="always"
						hide-details
						:label="t('windows.assetPreview.outputResolution')"
					/>

					<h2 class="mt-8 mb-3">
						{{ t('windows.assetPreview.backgroundColor') }}
					</h2>

					<v-color-picker
						v-model="state.backgroundColor"
						width="220px"
						hide-mode-switch
						elevation="2"
						mode="hexa"
					/>

					<h2 v-if="state.bones.length > 0" class="mt-8">
						{{ t('windows.assetPreview.boneVisibility') }}
					</h2>

					<v-checkbox
						v-for="(isVisible, boneName) in state.bones"
						:key="boneName"
						:label="boneName"
						v-model="state.bones[boneName]"
						@change="
							(isVisible) =>
								onBoneVisibilityChange(boneName, isVisible)
						"
						hide-details
					/>
				</div>
				<canvas
					class="ml-4 pa-1 rounded-lg outlined"
					style="position: sticky; top: 0"
					ref="canvas"
					height="500"
					width="500"
				/>
			</div>
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
import { Color } from 'three'
import { useTranslations } from '/@/components/Composables/useTranslations'
import { onMounted, ref, watch, watchEffect } from 'vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()
const window = props.window

const canvas = ref<HTMLCanvasElement | null>(null)

function onClose(wasCancelled: boolean) {
	props.window.startClosing(wasCancelled)
}
function onBoneVisibilityChange(boneName: string, isVisible: boolean) {
	if (!window.modelViewer) return

	if (isVisible) window.modelViewer.getModel().showBone(boneName)
	else window.modelViewer.getModel().hideBone(boneName)

	window.modelViewer.requestRendering()
}
onMounted(async () => {
	await props.window.receiveCanvas(canvas.value)

	watchEffect(() => {
		window.modelViewer.positionCamera(state.previewScale)
	})

	watchEffect(() => {
		window.modelViewer.scene.background = new Color(state.backgroundColor)
		window.modelViewer.requestRendering()
	})
})
</script>
