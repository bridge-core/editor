<template>
	<v-system-bar
		v-if="!isMobile"
		color="toolbar"
		fixed
		app
		clipped
		padless
		:height="appToolbarHeight"
		:class="{ 'd-flex align-center justify-center': hideToolbarItems }"
		:style="{
			'padding-left': 0,
			'margin-left': hideToolbarItems ? 0 : 'env(titlebar-area-x, 0)',
			width: hideToolbarItems ? '100%' : 'env(titlebar-area-width, 100%)',
			'z-index': windowControlsOverlay ? 1000 : undefined,
		}"
	>
		<template v-if="hideToolbarItems">
			<Logo
				height="22px"
				width="22px"
				style="padding-right: 8px"
				alt="Logo of bridge. v2"
				draggable="false"
			/>

			<div
				v-ripple
				@click="openCommandBar"
				class="toolbar-clickable outlined rounded-lg d-flex align-center justify-center"
				style="height: 20px"
			>
				<v-icon class="ml-1">mdi-magnify</v-icon>

				<span class="mr-1">
					{{ composedTitle }}
				</span>
			</div>
		</template>

		<template v-else>
			<Logo
				v-if="!isMacOS || !windowControlsOverlay"
				height="24px"
				width="24px"
				style="
					padding-right: 4px;
					padding-left: calc(env(safe-area-inset-left) + 4px);
				"
				alt="Logo of bridge. v2"
				draggable="false"
			/>

			<v-divider vertical />

			<!-- App menu buttons -->
			<v-toolbar-items class="px14-font">
				<template v-for="(item, key, i) in toolbar">
					<MenuButton
						v-if="item.type !== 'category'"
						:key="`button.${key}`"
						:displayName="item.name"
						:displayIcon="item.icon"
						:disabled="isAnyWindowVisible || item.isDisabled"
						@click="() => item.trigger()"
					/>
					<MenuActivator
						v-else-if="item.shouldRender"
						:key="`activator.${key}`"
						:item="item"
						:disabled="isAnyWindowVisible || item.isDisabled"
					/>
					<v-divider
						:key="`divider.${key}`"
						v-if="
							item.shouldRender &&
							(windowControlsOverlay ||
								i + 1 < Object.keys(toolbar).length)
						"
						vertical
					/>
				</template>
			</v-toolbar-items>

			<span v-if="windowControlsOverlay" class="pl-3">
				{{ composedTitle }}
			</span>

			<v-spacer />
			<div
				class="px-1 mx-1 rounded-lg app-version-display"
				v-ripple="!isAnyWindowVisible"
				:style="{
					opacity: isAnyWindowVisible ? 0.4 : null,
					'margin-right': 'env(safe-area-inset-right, 0)',
				}"
				@click="openChangelogWindow"
			>
				v{{ appVersion }}
			</div>
		</template>
	</v-system-bar>
</template>

<script>
import WindowAction from './WindowAction.vue'
import MenuActivator from './Menu/Activator.vue'
import MenuButton from './Menu/Button.vue'
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

		appVersion,
	}),
	computed: {
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
