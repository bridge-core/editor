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
				:windowTitle="t(windowTitle)"
				:hasMaximizeButton="hasMaximizeButton"
				:hasCloseButton="hasCloseButton"
				:hasSidebar="!!$slots.sidebar"
				:sidebarWidth="sidebarWidth"
				@toggleFullscreen="$emit('toggleFullscreen')"
				@closeWindow="$emit('closeWindow')"
			>
				<slot name="toolbar" />
			</component>

			<v-navigation-drawer
				v-if="$slots.sidebar"
				absolute
				:width="sidebarWidth"
				permanent
				clipped
				stateless
				color="expandedSidebar"
			>
				<MacWindowControls
					v-if="platform === 'darwin'"
					class="pl-3 pt-1"
					style="width: calc(100% - 1px); background-color: var(--v-expandedSidebar-base);"
					:hasMaximizeButton="hasMaximizeButton"
					:hasCloseButton="hasCloseButton"
					@toggleFullscreen="$emit('toggleFullscreen')"
					@closeWindow="$emit('closeWindow')"
				/>
				<v-container :class="{ 'pt-8': platform === 'darwin' }">
					<slot name="sidebar" />
				</v-container>
			</v-navigation-drawer>

			<v-card-text
				style="padding-top: 12px; overflow-y: auto;"
				:style="{
					height: `${
						isFullscreen ? maxWindowHeight : windowHeight
					}px`,
					'max-height': `${maxWindowHeight}px`,
					'padding-left': !!$slots.sidebar
						? `calc(${sidebarWidth} + 12px)`
						: undefined,
				}"
			>
				<slot name="default" />
			</v-card-text>

			<v-card-actions
				:style="{
					'padding-left': !!$slots.sidebar
						? `calc(${sidebarWidth} + 12px)`
						: undefined,
				}"
				background-color="footer"
			>
				<slot name="actions" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { platform } from '@/utils/os'
import { TranslationMixin } from '@/utils/locales'
import WindowsToolbar from './Toolbar/Windows.vue'
import MacToolbar from './Toolbar/Mac.vue'
import MacWindowControls from './Toolbar/Mac/WindowControls.vue'

export default {
	name: 'BaseWindow',
	mixins: [TranslationMixin],
	components: {
		WindowsToolbar,
		MacToolbar,
		MacWindowControls,
	},
	props: {
		isFullscreen: Boolean,
		isVisible: Boolean,
		isPersistent: Boolean,
		sidebarWidth: {
			type: String,
			default: '25%',
		},
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
