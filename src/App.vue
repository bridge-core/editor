<template>
	<v-app>
		<!-- We need access to native menus in order to hide the custom one on MacOS -->
		<!-- <Toolbar v-if="!isMacOs" /> -->
		<Toolbar />

		<Sidebar app />

		<v-main :style="{ 'padding-top': 'env(titlebar-area-height, 24px)' }">
			<WindowRenderer />

			<v-row
				no-gutters
				class="d-flex fill-area"
				:class="{ 'flex-row-reverse': isSidebarRight }"
			>
				<v-col :cols="isSidebarContentVisible ? 3 + sidebarSize : 0">
					<SidebarContent />
				</v-col>

				<v-col
					:cols="isSidebarContentVisible ? 9 - sidebarSize : 12"
					class="flex-grow-1"
				>
					<div v-if="shouldRenderWelcomeScreen" class="d-flex">
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
							vertical
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
import { TabSystemMixin } from '/@/components/Mixins/TabSystem'
import ContextMenu from '/@/components/ContextMenu/ContextMenu.vue'
import { App } from '/@/App.ts'
import TabSystem from '/@/components/TabSystem/TabSystem.vue'
import WelcomeScreen from '/@/components/TabSystem/WelcomeScreen.vue'
import FileDropper from '/@/components/FileDropper/FileDropperUI.vue'
import InitialSetupDialog from '/@/components/InitialSetup/Dialog.vue'
import SidebarContent from './components/Sidebar/Content/Main.vue'
import { isContentVisible } from './components/Sidebar/state'
import { settingsState } from './components/Windows/Settings/SettingsState'

export default {
	name: 'App',
	mixins: [TabSystemMixin],

	setup() {
		return {
			isSidebarContentVisible: isContentVisible,
		}
	},
	mounted() {
		App.getApp().then((app) => {
			this.contextMenu = app.contextMenu
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
	}),

	computed: {
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
	},
}
</script>

<style>
/** Reset vuetify's scrolling */
html {
	overflow: hidden;
	overscroll-behavior: contain;
}
body {
	overflow: unset;
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
	font-size: 0.8rem;
}
.clickable {
	cursor: pointer;
	border-radius: 4px;
}
</style>
