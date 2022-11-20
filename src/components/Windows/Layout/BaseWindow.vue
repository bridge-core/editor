<template>
	<v-dialog
		:value="isVisible"
		:fullscreen="!isSmallPopup && $vuetify.breakpoint.mobile"
		@input="$emit('closeWindow')"
		:persistent="isPersistent"
		:hide-overlay="!blurBackground"
		:max-width="isFullScreenOrMobile ? maxWindowWidth : windowWidth"
		content-class="no-overflow"
	>
		<v-card
			height="100%"
			width="100%"
			color="background"
			:rounded="isFullScreenOrMobile ? null : 'lg'"
			ref="card"
		>
			<component
				v-if="!hideToolbar"
				:is="platform === 'darwin' ? 'MacToolbar' : 'WindowsToolbar'"
				:windowTitle="t(windowTitle)"
				:actions="actions"
				:hasMaximizeButton="hasMaximizeButton"
				:hasCloseButton="hasCloseButton"
				:hasSidebar="!!$slots.sidebar"
				:sidebarWidth="calcSidebarWidth"
				@toggleFullscreen="$emit('toggleFullscreen')"
				@closeWindow="$emit('closeWindow')"
			>
				<slot name="toolbar" />
			</component>

			<v-navigation-drawer
				v-if="$slots.sidebar"
				absolute
				:width="calcSidebarWidth"
				permanent
				clipped
				stateless
				color="expandedSidebar"
				:class="isFullScreenOrMobile ? null : 'rounded-l-lg'"
				style="visibility: visible; transform: translateX(0)"
			>
				<MacWindowControls
					v-if="platform === 'darwin'"
					class="pl-3 pt-1"
					style="
						width: calc(100% - 1px);
						background-color: var(--v-expandedSidebar-base);
					"
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
				style="overflow-y: auto"
				:class="{
					'd-flex align-center justify-center': isLoading,
				}"
				:style="{
					height: heightUnset
						? undefined
						: `${
								isFullScreenOrMobile
									? maxWindowHeight
									: windowHeight
						  }px`,
					'max-height': `${maxWindowHeight}px`,
					'padding-top': hideToolbar ? '24px' : '12px',
					'padding-left': !!$slots.sidebar
						? `calc(${calcSidebarWidth} + 12px)`
						: undefined,
				}"
			>
				<v-progress-circular
					v-if="isLoading"
					indeterminate
					color="accent"
					size="42"
				/>
				<slot v-else name="default" />
			</v-card-text>

			<v-card-actions
				v-if="$slots.actions"
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
import { platform } from '/@/utils/os.ts'
import { useTranslations } from '/@/components/Composables/useTranslations.ts'
import WindowsToolbar from './Toolbar/Windows.vue'
import MacToolbar from './Toolbar/Mac.vue'
import MacWindowControls from './Toolbar/Mac/WindowControls.vue'
import { debounce } from 'lodash-es'

export default {
	name: 'BaseWindow',
	components: {
		WindowsToolbar,
		MacToolbar,
		MacWindowControls,
	},
	props: {
		isFullscreen: Boolean,
		isLoading: Boolean,
		isVisible: Object | Boolean,
		shouldRender: Object | Boolean,
		isPersistent: Boolean,
		actions: Array,
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
			default: false,
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
		heightUnset: Boolean,
		percentageHeight: Number,
		percentageWidth: Number,
		maxPercentageHeight: Number,
		maxPercentageWidth: Number,
		isSmallPopup: Boolean,
	},
	setup() {
		const { t } = useTranslations()

		return {
			t,
		}
	},
	data() {
		return {
			platform: platform(),
			globalWindowWidth: window.innerWidth,
			globalWindowHeight: window.innerHeight,
			updateWindowSize: debounce(function () {
				this.globalWindowWidth = window.innerWidth
				this.globalWindowHeight = window.innerHeight
			}, 200).bind(this),
		}
	},
	mounted() {
		window.addEventListener('resize', this.updateWindowSize)
	},
	destroyed() {
		window.removeEventListener('resize', this.updateWindowSize)
	},

	computed: {
		calcSidebarWidth() {
			if (this.$vuetify.breakpoint.mobile) return '76px'

			return this.sidebarWidth
		},
		isFullScreenOrMobile() {
			return (
				(!this.isSmallPopup && this.$vuetify.breakpoint.mobile) ||
				this.isFullscreen
			)
		},
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
		windowWidth() {
			if (this.percentageWidth == undefined) {
				return this.width
			} else {
				return (this.globalWindowWidth / 100) * this.percentageWidth
			}
		},
		windowHeight() {
			if (this.percentageHeight == undefined) {
				return this.height
			} else {
				return (
					(this.globalWindowHeight / 100) * this.percentageHeight -
					150
				)
			}
		},
		maxWindowWidth() {
			if (this.maxPercentageWidth == undefined) {
				return this.maxWidth
			} else {
				return (this.globalWindowWidth / 100) * this.maxPercentageWidth
			}
		},
		maxWindowHeight() {
			if (!this.isSmallPopup && this.$vuetify.breakpoint.mobile)
				return (
					this.globalWindowHeight -
					!this.hideToolbar * 30 -
					!!this.$slots.actions * 52
				)

			if (this.maxPercentageHeight == undefined) {
				return this.maxHeight
			} else {
				return (
					(this.globalWindowHeight / 100) * this.maxPercentageHeight -
					150
				)
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
