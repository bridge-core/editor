<template>
	<v-app
		ref="appContainer"
		:style="{ fontFamily }"
		@contextmenu.native="$event.preventDefault()"
	>
		<!-- We need access to native menus in order to hide the custom one on MacOS -->
		<!-- <Toolbar v-if="!isMacOs" /> -->
		<Toolbar v-if="!isInFullScreen" />

		<!-- Screen for when no projects are opened-->
		<Greet v-if="isNoProjectSelected" />

		<!-- main editor-->
		<div v-if="!isNoProjectSelected">
			<Sidebar v-if="!isInFullScreen" app />

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

			<v-main
				:style="{
					'padding-top': isInFullScreen ? 0 : appToolbarHeight,
				}"
			>
				<v-row
					no-gutters
					class="d-flex fill-area"
					:class="{
						'flex-row-reverse': isSidebarRight,
					}"
				>
					<v-col
						v-if="isSidebarContentVisible"
						:cols="isSidebarContentVisible ? 3 + sidebarSize : 0"
					>
						<SidebarContent :isSidebarRight="isSidebarRight" />
					</v-col>

					<v-col
						:cols="isSidebarContentVisible ? 9 - sidebarSize : 12"
						class="flex-grow-1"
					>
						<div
							v-if="shouldRenderWelcomeScreen"
							class="d-flex"
							:class="{
								'flex-column': $vuetify.breakpoint.mobile,
							}"
							:style="{
								height: `calc(${windowSize.currentHeight}px - ${appToolbarHeight} - ${bottomPanelHeight}px)`,
							}"
						>
							<!-- <v-divider
							v-if="isSidebarContentVisible && !isSidebarRight"
							style="z-index: 1"
							vertical
						/> -->

							<TabSystem class="flex-grow-1" />
							<v-divider
								v-if="
									tabSystems[0].shouldRender.value &&
									tabSystems[1].shouldRender.value
								"
								style="z-index: 1"
								:vertical="!$vuetify.breakpoint.mobile"
							/>
							<TabSystem class="flex-grow-1" :id="1" />

							<!-- <v-divider
							v-if="isSidebarContentVisible && isSidebarRight"
							vertical
						/> -->
						</div>
						<WelcomeScreen
							v-else
							:height="
								windowSize.currentHeight -
								appToolbarHeightNumber -
								bottomPanelHeight
							"
						/>

						<BottomPanel v-if="!$vuetify.breakpoint.mobile" />
					</v-col>
				</v-row>
			</v-main>
		</div>

		<ContextMenu
			v-if="contextMenu"
			:contextMenu="contextMenu"
			:windowHeight="windowSize.currentHeight"
		/>

		<SolidWindows />

		<WindowRenderer />
	</v-app>
</template>

<script>
import Sidebar from './components/Sidebar/Sidebar.vue'
import Toolbar from './components/Toolbar/Main.vue'
import WindowRenderer from './components/Windows/Collect.vue'
import { platform } from './utils/os'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'
import ContextMenu from '/@/components/ContextMenu/ContextMenu.vue'
import { App } from '/@/App.ts'
import TabSystem from '/@/components/TabSystem/TabSystem.vue'
import WelcomeScreen from '/@/components/TabSystem/WelcomeScreen.vue'
import SidebarContent from './components/Sidebar/Content/Main.vue'
import { settingsState } from './components/Windows/Settings/SettingsState'
import { useTabSystem } from './components/Composables/UseTabSystem'
import {
	setFullscreenElement,
	useFullScreen,
} from './components/TabSystem/TabContextMenu/Fullscreen'
import BottomPanel from './components/BottomPanel/BottomPanel.vue'
import { useSidebarState } from './components/Composables/Sidebar/useSidebarState'
import Greet from './components/Greet/Greet.vue'

export default {
	name: 'App',
	mixins: [AppToolbarHeightMixin],

	setup() {
		const { tabSystem, tabSystems, shouldRenderWelcomeScreen } =
			useTabSystem()
		const { isInFullScreen } = useFullScreen()
		const { isNavVisible, isContentVisible, isAttachedRight } =
			useSidebarState()

		return {
			tabSystem,
			tabSystems,
			shouldRenderWelcomeScreen,
			isInFullScreen,
			sidebarNavigationVisible: isNavVisible,
			isSidebarContentVisible: isContentVisible,
			isSidebarRight: isAttachedRight,
		}
	},

	mounted() {
		App.getApp().then((app) => {
			this.contextMenu = app.contextMenu
			this.windowSize = app.windowResize.state

			this.disposables.push(
				App.eventSystem.on(
					'projectChanged',
					() => (this.isNoProjectSelected = app.isNoProjectSelected)
				)
			)

			this.disposables.push(
				App.eventSystem.on(
					'comMojangProjectChanged',
					() => (this.isNoProjectSelected = app.isNoProjectSelected)
				)
			)
		})

		setFullscreenElement(this.$refs.appContainer.$el)
	},

	components: {
		Sidebar,
		Toolbar,
		WindowRenderer,
		ContextMenu,
		TabSystem,
		WelcomeScreen,
		SidebarContent,
		BottomPanel,
		SolidWindows: App.solidWindows.getVueComponent(),
		Greet,
	},

	data: () => ({
		isMacOs: platform() === 'darwin',
		contextMenu: null,
		settingsState: settingsState,
		windowSize: {
			currentWidth: window.innerWidth,
			currentHeight: window.innerHeight,
		},
		isNoProjectSelected: true,
		disposables: [],
	}),

	computed: {
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
		fontFamily() {
			return this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.font
				? `${this.settingsState.appearance.font}, system-ui !important`
				: `Roboto, system-ui !important`
		},
		bottomPanelHeight() {
			return App.bottomPanel.currentHeight.value
		},
	},
	methods: {
		openSidebar() {
			App.sidebar.isNavigationVisible.value = true
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
	background-color: var(--v-scrollbarThumb-base);
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
.cursor-pointer {
	cursor: pointer;
}
.no-pointer-events {
	pointer-events: none;
}
.outlined {
	border-width: thin;
	border-color: #555555;
	border-style: solid;
}
.theme--light .outlined {
	border-color: #a4a4a4;
}

input,
textarea {
	color: var(--v-text-base);
}

.suggest-details .header {
	font-size: unset !important;
	font-weight: unset !important;
	letter-spacing: unset !important;
	line-height: unset !important;
}

/* Properly center custom icons (e.g. blockbench) within lists  */
.v-list-item__icon {
	align-items: center;
}
</style>
