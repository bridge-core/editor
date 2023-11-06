<template>
	<v-system-bar
		v-if="!isMobile"
		color="background"
		fixed
		app
		clipped
		padless
		data-tauri-drag-region
		:height="appToolbarHeight"
		:class="{ 'd-flex align-center justify-center': hideToolbarItems }"
		:style="{
			'padding-left': toolbarPaddingLeft,
			'margin-left': hideToolbarItems ? 0 : 'env(titlebar-area-x, 0)',
			width: hideToolbarItems ? '100%' : 'env(titlebar-area-width, 100%)',
			'z-index': windowControlsOverlay ? 1000 : undefined,
		}"
	>
		<template v-if="hideToolbarItems">
			<div
				v-ripple
				@click="openCommandBar"
				class="toolbar-clickable outlined rounded d-flex align-center justify-center"
				style="height: 20px"
			>
				<v-icon class="ml-1">mdi-magnify</v-icon>

				<span class="mr-1">
					{{ composedTitle }}
				</span>
			</div>
		</template>

		<template v-else>
			<!-- App menu buttons -->
			<v-toolbar-items class="px14-font">
				<template v-for="(item, key, i) in toolbar">
					<MenuButton
						v-if="item.type !== 'category'"
						:key="`button.${key}`"
						:displayIcon="item.icon"
						:displayName="item.name"
						:disabled="isAnyWindowVisible || item.isDisabled"
						@click="() => item.trigger()"
					/>
					<MenuActivator
						v-else-if="item.shouldRender.value"
						:key="`activator.${key}`"
						:item="item"
						:disabled="isAnyWindowVisible || item.isDisabled"
					/>
				</template>
			</v-toolbar-items>

			<span v-if="windowControlsOverlay" class="pl-3 no-pointer-events">
				{{ composedTitle }}
			</span>

			<v-spacer />

			<Logo
				height="24px"
				width="24px"
				style="
					padding-right: 4px;
					padding-left: calc(env(safe-area-inset-left) + 4px);
				"
				class="cursor-pointer"
				alt="Logo of bridge. v2"
				draggable="false"
				@click.native="openChangelogWindow"
			/>

			<div
				class="px-1 mr-1 rounded app-version-display"
				v-ripple="!isAnyWindowVisible"
				:style="{
					opacity: isAnyWindowVisible ? 0.4 : null,
					'margin-right': 'env(safe-area-inset-right, 0)',
				}"
				@click="openChangelogWindow"
			>
				v{{ appVersion }}
			</div>

			<WindowControls v-if="isTauriBuild && isWindows" />
		</template>
	</v-system-bar>
</template>

<script>
import WindowAction from './WindowAction.vue'
import MenuActivator from './Menu/Activator.vue'
import MenuButton from './Menu/Button.vue'
import WindowControls from './WindowControls.vue'
import { App } from '/@/App.ts'
import { version as appVersion } from '/@/utils/app/version.ts'
import { platform } from '/@/utils/os.ts'
import { reactive } from 'vue'
import { WindowControlsOverlayMixin } from '/@/components/Mixins/WindowControlsOverlay.ts'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'
import Logo from '../UIElements/Logo.vue'
import { settingsState } from '../Windows/Settings/SettingsState'
import { CommandBarState } from '../CommandBar/State'

export default {
	name: 'Toolbar',
	mixins: [WindowControlsOverlayMixin, AppToolbarHeightMixin],
	components: {
		WindowAction,
		MenuActivator,
		MenuButton,
		Logo,
		WindowControls,
	},
	setup() {
		const setupObj = reactive({
			title: '',
			appName: '',
			isAnyWindowVisible: App.windowState.isAnyWindowVisible,
		})

		App.getApp().then((app) => {
			setupObj.title = app.projectManager.title.current
			setupObj.appName = app.projectManager.title.appName
		})

		return setupObj
	},
	data: () => ({
		toolbar: App.toolbar.state,
		settingsState,
		isMacOS: platform() === 'darwin',
		isWindows: platform() === 'win32',
		isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,

		appVersion,
	}),
	computed: {
		showLogo() {
			// On MacOS, only show logo if windowControlsOverlay is inactive
			if (this.isMacOS) return !this.windowControlsOverlay

			// On other platforms, always show logo
			return true
		},
		isMobile() {
			return this.$vuetify.breakpoint.mobile
		},
		hideToolbarItemsSetting() {
			if (!this.settingsState.appearance) return false
			return this.settingsState.appearance.hideToolbarItems ?? false
		},
		hideToolbarItems() {
			return this.hideToolbarItemsSetting && this.windowControlsOverlay
		},
		composedTitle() {
			if (!this.title) return this.appName
			return `${this.appName} - ${this.title}`
		},
	},
	methods: {
		async openChangelogWindow() {
			if (this.isAnyWindowVisible) return

			const app = await App.getApp()
			await app.windows.changelogWindow.open()
		},
		async openCommandBar() {
			if (this.isAnyWindowVisible) return

			CommandBarState.isWindowOpen = true
		},
	},
}
</script>

<style scoped>
.v-system-bar {
	app-region: drag;
	-webkit-app-region: drag;
	padding-right: 0;
}

.toolbar-btn {
	app-region: no-drag;
	-webkit-app-region: no-drag;
	min-width: 0;
}
.toolbar-clickable {
	app-region: no-drag;
	-webkit-app-region: no-drag;
}
.app-version-display {
	app-region: no-drag;
	-webkit-app-region: no-drag;
	cursor: pointer;
	font-size: 12px;
}
</style>
