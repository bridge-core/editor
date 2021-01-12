<template>
	<v-dialog
		:value="isVisible"
		@input="$emit('closeWindow')"
		:persistent="isPersistent"
		:hide-overlay="!blurBackground"
		:max-width="isFullscreen ? maxWindowWidth : windowWidth"
		content-class="no-overflow"
	>
		<v-card
			height="100%"
			width="100%"
			color="background"
			:rounded="platform === 'darwin' ? 'lg' : undefined"
		>
			<component
				v-if="!hideToolbar"
				:is="platform === 'darwin' ? 'MacToolbar' : 'WindowsToolbar'"
				:hideToolbar="hideToolbar"
				:windowTitle="windowTitle"
				:hasMaximizeButton="hasMaximizeButton"
				:hasCloseButton="hasCloseButton"
				@toggleFullscreen="$emit('toggleFullscreen')"
				@closeWindow="$emit('closeWindow')"
			/>

			<v-card-text
				:style="
					`padding-top: 12px; max-height: ${maxWindowHeight}px; height: ${
						isFullscreen ? maxWindowHeight : windowHeight
					}px; overflow-y: auto;`
				"
			>
				<slot name="default" />
			</v-card-text>

			<v-card-actions background-color="footer">
				<slot name="actions" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { platform } from '@/utils/os'
import WindowsToolbar from './Toolbar/Windows.vue'
import MacToolbar from './Toolbar/Mac.vue'

export default {
	name: 'BaseWindow',
	components: {
		WindowsToolbar,
		MacToolbar,
	},
	props: {
		isFullscreen: Boolean,
		isVisible: Boolean,
		isPersistent: Boolean,
		blurBackground: {
			type: Boolean,
			default: true,
		},
		hideToolbar: Boolean,
		windowTitle: String,
		hasCloseButton: {
			type: Boolean,
			default: true,
		},
		hasMaximizeButton: {
			type: Boolean,
			default: true,
		},
		width: {
			type: Number,
			default: 1600,
		},
		maxWidth: {
			type: Number,
			default: 1600,
		},
		height: {
			type: Number,
			default: 800,
		},
		maxHeight: {
			type: Number,
			default: 800,
		},
		percentageHeight: Number,
		percentageWidth: Number,
		maxPercentageHeight: Number,
		maxPercentageWidth: Number,
	},
	data: () => ({
		platform: platform(),
	}),
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
		windowWidth() {
			if (this.percentageWidth == undefined) {
				return this.width
			} else {
				return (window.innerWidth / 100) * this.percentageWidth
			}
		},
		windowHeight() {
			if (this.percentageHeight == undefined) {
				return this.height
			} else {
				return (window.innerHeight / 100) * this.percentageHeight - 150
			}
		},
		maxWindowHeight() {
			if (this.maxPercentageHeight == undefined) {
				return this.maxHeight
			} else {
				return (
					(window.innerHeight / 100) * this.maxPercentageHeight - 150
				)
			}
		},
		maxWindowWidth() {
			if (this.maxPercentageWidth == undefined) {
				return this.maxWidth
			} else {
				return (window.innerWidth / 100) * this.maxPercentageWidth
			}
		},
	},
}
</script>

<style>
.no-overflow {
	overflow: hidden;
}
</style>
