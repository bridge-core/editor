<template>
	<v-app
		theme="dark"
		:style="{ fontFamily, height: '100vh' }"
		@contextmenu="$event.preventDefault()"
	>
		<!-- We need access to native menus in order to hide the custom one on MacOS -->
		<!-- <Toolbar v-if="!isMacOs" /> -->
		<Toolbar />

		<Sidebar app />

		<v-btn
			v-if="!sidebarNavigationVisible"
			small
			fab
			fixed
			style="bottom: calc(env(safe-area-inset-bottom, 0) + 16px)"
			:left="!isSidebarRight"
			:right="isSidebarRight"
			color="primary"
			@click="openSidebar"
		>
			<v-icon>mdi-table-column</v-icon>
		</v-btn>

		<v-main :style="{ 'padding-top': appToolbarHeight }">
			<WindowRenderer />

			<v-row
				no-gutters
				class="d-flex fill-area"
				:class="{ 'flex-row-reverse': isSidebarRight }"
			>
				<v-col
					v-if="isSidebarContentVisible"
					:cols="isSidebarContentVisible ? 3 + sidebarSize : 0"
				>
					<SidebarContent />
				</v-col>

				<v-col
					:cols="isSidebarContentVisible ? 9 - sidebarSize : 12"
					class="flex-grow-1"
				>
					<div
						v-if="shouldRenderWelcomeScreen"
						class="d-flex"
						:class="{ 'flex-column': $vuetify.display.mobile }"
						:style="{
							height: `calc(${windowSize.currentHeight}px - ${appToolbarHeight})`,
						}"
					>
						<v-divider
							v-if="isSidebarContentVisible && !isSidebarRight"
							style="z-index: 1"
							vertical
						/>

						<TabSystem
							class="flex-grow-1"
							:tabSystem="tabSystems[0]"
							showWelcomeScreen
						/>
						<v-divider
							v-if="
								tabSystems[0].shouldRender &&
								tabSystems[1].shouldRender
							"
							style="z-index: 1"
							:vertical="!$vuetify.display.mobile"
						/>
						<TabSystem
							class="flex-grow-1"
							:tabSystem="tabSystems[1]"
							:id="1"
						/>

						<v-divider
							v-if="isSidebarContentVisible && isSidebarRight"
							vertical
						/>
					</div>
					<WelcomeScreen
						v-else
						:containerPadding="
							isSidebarContentVisible
								? isSidebarRight
									? 'pl-2'
									: 'pr-2'
								: 'px-2'
						"
					/>
				</v-col>
			</v-row>

			<!--  -->
		</v-main>

		<ContextMenu v-if="contextMenu" :contextMenu="contextMenu" />
		<FileDropper />
	</v-app>
</template>

<script>
import Sidebar from './components/Sidebar/Sidebar.vue'
import Toolbar from './components/Toolbar/Main.vue'
import WindowRenderer from './components/Windows/Collect.vue'
import { platform } from './utils/os'
import { TabSystemMixin } from '/@/components/Mixins/TabSystem.ts'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'
import ContextMenu from '/@/components/ContextMenu/ContextMenu.vue'
import { App } from '/@/App.ts'
import TabSystem from '/@/components/TabSystem/TabSystem.vue'
import WelcomeScreen from '/@/components/TabSystem/WelcomeScreen.vue'
import FileDropper from '/@/components/FileDropper/FileDropperUI.vue'
import SidebarContent from './components/Sidebar/Content/Main.vue'
import { isContentVisible, SidebarState } from './components/Sidebar/state'
import { settingsState } from './components/Windows/Settings/SettingsState'

export default {
	name: 'App',
	mixins: [TabSystemMixin, AppToolbarHeightMixin],

	mounted() {
		App._instanceReady.once((app) => {
			app.mounted(this.$vuetify)
			this.contextMenu = app.contextMenu
			this.windowSize = app.windowResize.state
		})
	},

	components: {
		Sidebar,
		Toolbar,
		WindowRenderer,
		ContextMenu,
		TabSystem,
		WelcomeScreen,
		FileDropper,
		SidebarContent,
	},

	data: () => ({
		isMacOs: platform() === 'darwin',
		contextMenu: null,
		settingsState: settingsState,
		windowSize: {
			currentWidth: window.innerWidth,
			currentHeight: window.innerHeight,
		},
	}),

	computed: {
		isSidebarContentVisible() {
			return this.sidebarNavigationVisible && isContentVisible.value
		},
		sidebarNavigationVisible() {
			return SidebarState.isNavigationVisible
		},
		isSidebarRight() {
			return (
				this.settingsState &&
				this.settingsState.sidebar &&
				this.settingsState.sidebar.isSidebarRight
			)
		},
		sidebarSize() {
			let size =
				this.settingsState && this.settingsState.sidebar
					? this.settingsState.sidebar.sidebarSize
					: undefined
			if (!size) size = 'normal'
			if (this.$vuetify.display.mobile) return 9

			switch (size) {
				case 'tiny':
					return -2
				case 'small':
					return -1
				case 'normal':
					return 0
				case 'large':
					return 1
			}
		},
		fontFamily() {
			return this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.font
				? `${this.settingsState.appearance.font} !important`
				: 'Roboto !important'
		},
	},
	methods: {
		openSidebar() {
			SidebarState.isNavigationVisible = true
		},
	},
	watch: {
		'$vuetify.display.mobile'() {
			this.$nextTick(() => {
				App.getApp().then((app) => app.windowResize.dispatch())
			})
		},
	},
}
</script>

<style>
/** Reset vuetify's scrolling */
html {
	overflow-y: hidden !important;
	overscroll-behavior: none;
}
body {
	overflow: unset;
	/** This terrible hack is needed to disable safari's overflow scrolling */
	position: fixed;
	width: 100%;
	height: 100vh;
	padding-left: env(safe-area-inset-left, 0);
}

/** Scrollbar */
*::-webkit-scrollbar {
	border-radius: 24px;
	width: 8px;
	height: 8px;
}
*::-webkit-scrollbar-track {
	border-radius: 24px;
}
*::-webkit-scrollbar-thumb {
	border-radius: 24px;
	background-color: rgb(var(--v-theme-scrollbarThumb));
	border: thin solid rgba(0, 0, 0, 0.3);
	opacity: 0.8;
}

.theme--dark *::-webkit-scrollbar-thumb {
	border: thin solid rgba(255, 255, 255, 0.35);
}

summary::-webkit-details-marker {
	display: none;
}

/* No text selection */
:root {
	-moz-user-select: none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	user-select: none;
	touch-action: manipulation;
}
.text-normal {
	font-size: 1rem !important;
	font-weight: 400;
	letter-spacing: 0.03125em !important;
	line-height: 1.5rem;
}

.v-application {
	background: rgb(var(--v-theme-background)) !important;
}

.v-system-bar .v-icon {
	margin-right: 0;
}
.v-system-bar {
	width: calc(100% + 1px);
}

.v-select-list {
	background-color: rgb(var(--v-theme-menu)) !important;
}
.fill-area {
	width: 100%;
	height: 100%;
}
.code-font {
	font-family: Menlo, Monaco, 'Courier New', monospace;
}
.clickable {
	cursor: pointer;
	border-radius: 4px;
}
.cursor-pointer {
	cursor: pointer;
}
.outlined {
	border-width: thin;
	border-color: #555555;
	border-style: solid;
}
.theme--light .outlined {
	border-color: #a4a4a4;
}
</style>
