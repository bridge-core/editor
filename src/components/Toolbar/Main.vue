<template>
	<v-system-bar
		color="toolbar"
		fixed
		app
		clipped
		padless
		height="env(titlebar-area-height, 24px)"
		:style="{
			'padding-left': isMacOS ? 'env(titlebar-area-x, 8px)' : undefined,
			'padding-right': !isMacOS ? 'env(titlebar-area-x, 0)' : undefined,
			'z-index': windowControlsOverlay ? 1000 : undefined,
		}"
	>
		<img
			v-if="!isMacOS || !windowControlsOverlay"
			style="height: 20px; padding-right: 4px"
			alt="bridge. Logo"
			draggable="false"
			src="@/_assets/logo.svg"
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
					:disabled="isAnyWindowVisible"
					@click="() => item.trigger()"
				/>
				<MenuActivator
					v-else
					:key="`activator.${key}`"
					:item="item"
					:disabled="isAnyWindowVisible"
				/>
				<v-divider
					:key="`divider.${key}`"
					v-if="
						windowControlsOverlay ||
						i + 1 < Object.keys(toolbar).length
					"
					vertical
				/>
			</template>
		</v-toolbar-items>

		<span v-if="windowControlsOverlay" class="pl-3">
			{{ title }}
		</span>

		<v-spacer />
		<div
			class="px-1 mx-1 rounded-lg app-version-display"
			v-ripple
			@click="openChangelogWindow"
		>
			v{{ appVersion }}
		</div>
	</v-system-bar>
</template>

<script>
import WindowAction from './WindowAction.vue'
import MenuActivator from './Menu/Activator.vue'
import MenuButton from './Menu/Button.vue'
import { App } from '/@/App.ts'
import { version as appVersion } from '/@/appVersion.json'
import { platform } from '/@/utils/os'
import { reactive, watchEffect } from '@vue/composition-api'
import { WindowState } from '/@/components/Windows/WindowState'

export default {
	name: 'Toolbar',
	components: {
		WindowAction,
		MenuActivator,
		MenuButton,
	},
	setup() {
		const setupObj = reactive({
			title: 'bridge.',
			isAnyWindowVisible: WindowState.isAnyWindowVisible,
		})

		App.getApp().then((app) => {
			setupObj.title = app.projectManager.title.current
		})

		return setupObj
	},
	data: () => ({
		toolbar: App.toolbar.state,
		isMacOS: platform() === 'darwin',

		appVersion,
		windowControlsOverlay:
			navigator.windowControlsOverlay &&
			navigator.windowControlsOverlay.visible,
	}),
	mounted() {
		if (navigator.windowControlsOverlay) {
			navigator.windowControlsOverlay.addEventListener(
				'geometrychange',
				(event) => {
					this.windowControlsOverlay = event.visible
				}
			)
		}
	},
	methods: {
		async openChangelogWindow() {
			const app = await App.getApp()
			await app.windows.changelogWindow.open()
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
.app-version-display {
	cursor: pointer;
	font-size: 12px;
}
</style>
