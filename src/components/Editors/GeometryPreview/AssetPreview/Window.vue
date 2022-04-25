<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.assetPreview.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="false"
		:hasCloseButton="false"
		:width="760"
		:height="560"
		@closeWindow="onClose(true)"
	>
		<template #default>
			<div class="d-flex">
				<div style="width: 200px">
					<v-text-field
						v-model="assetName"
						outlined
						dense
						:label="t('windows.assetPreview.assetName')"
					/>

					<v-slider
						v-model="previewScale"
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
						v-model="outputResolution"
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
						v-model="backgroundColor"
						width="220px"
						hide-mode-switch
						elevation="2"
						mode="hexa"
					/>

					<h2 class="mt-8">
						{{ t('windows.assetPreview.boneVisibility') }}
					</h2>

					<v-checkbox
						v-for="(isVisible, boneName) in bones"
						:key="boneName"
						:label="boneName"
						v-model="bones[boneName]"
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

<script>
import PresetPath from '/@/components/Windows/Project/CreatePreset/PresetPath.vue'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { Color } from 'three'

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
	mounted() {
		this.currentWindow.receiveCanvas(this.$refs.canvas)
	},
	methods: {
		onClose(wasCancelled) {
			this.currentWindow.startClosing(wasCancelled)
		},
		onBoneVisibilityChange(boneName, isVisible) {
			if (!this.modelViewer) return

			if (isVisible) this.modelViewer.getModel().showBone(boneName)
			else this.modelViewer.getModel().hideBone(boneName)

			this.modelViewer.requestRendering()
		},
	},
	watch: {
		previewScale() {
			if (!this.modelViewer) return

			this.modelViewer.positionCamera(this.previewScale)
		},
		backgroundColor() {
			if (!this.modelViewer) return

			this.modelViewer.scene.background = new Color(this.backgroundColor)
			this.modelViewer.requestRendering()
		},
	},
}
</script>
