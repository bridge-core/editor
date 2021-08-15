<template>
	<v-app :style="{ fontSize }" @contextmenu.native="$event.preventDefault()">
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
						:class="{ 'flex-column': $vuetify.breakpoint.mobile }"
						:style="{
							height: `calc(${windowSize.currentHeight}px - ${appToolbarHeight})`,
						}"
					>
						<v-divider
							v-if="isSidebarContentVisible && !isSidebarRight"
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
							:vertical="!$vuetify.breakpoint.mobile"
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
					<WelcomeScreen v-else />
				</v-col>
			</v-row>

			<!--  -->
		</v-main>

		<InitialSetupDialog />
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
import InitialSetupDialog from '/@/components/InitialSetup/Dialog.vue'
import SidebarContent from './components/Sidebar/Content/Main.vue'
import { isContentVisible, SidebarState } from './components/Sidebar/state'
import { settingsState } from './components/Windows/Settings/SettingsState'

export default {
	name: 'App',
	mixins: [TabSystemMixin, AppToolbarHeightMixin],

	mounted() {
		App.getApp().then((app) => {
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
		InitialSetupDialog,
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
			if (this.$vuetify.breakpoint.mobile) return 9

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
		fontSize() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.fontSize
				? `${settingsState.appearance.fontSize} !important`
				: '16px'
		},
	},
	methods: {
		openSidebar() {
			SidebarState.isNavigationVisible = true
		},
	},
	watch: {
		'$vuetify.breakpoint.mobile'() {
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
	overflow: hidden;
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
	background-color: rgba(200, 200, 200, 0.8);
	border: thin solid rgba(0, 0, 0, 0.12);
}

.theme--dark *::-webkit-scrollbar-thumb {
	border-radius: 24px;
	background-color: rgba(0, 0, 0, 0.8);
	border: thin solid rgba(255, 255, 255, 0.2);
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

.v-application {
	background: var(--v-background-base) !important;
}

.v-system-bar .v-icon {
	margin-right: 0;
}
.v-system-bar {
	width: calc(100% + 1px);
}

.v-select-list {
	background-color: var(--v-menu-base) !important;
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
</style>
