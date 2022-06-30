<template>
	<v-system-bar
		color="toolbar"
		fixed
		app
		clipped
		padless
		:style="{
			'padding-left': 0,
			'margin-left': 'env(titlebar-area-x, 0)',
			width: 'env(titlebar-area-width, 100%)',
			height: appToolbarHeight,
			'z-index': windowControlsOverlay ? 1000 : undefined,
		}"
	>
		<Logo
			v-if="!isMacOS || !windowControlsOverlay"
			style="
				height: 20px;
				padding-right: 4px;
				padding-left: calc(env(safe-area-inset-left) + 4px);
			"
			alt="Logo of bridge. v2"
			draggable="false"
		/>

		<v-divider vertical />

		<!-- App menu buttons -->
		<v-toolbar-items>
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
			{{ title }}
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
	</v-system-bar>
</template>

<script>
import WindowAction from './WindowAction.vue'
import MenuActivator from './Menu/Activator.vue'
import MenuButton from './Menu/Button.vue'
import { App } from '/@/App.ts'
import { version as appVersion } from '/@/utils/app/version.ts'
import { platform } from '/@/utils/os.ts'
import { watch, ref } from 'vue'
import { WindowControlsOverlayMixin } from '/@/components/Mixins/WindowControlsOverlay.ts'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'
import Logo from '../UIElements/Logo.vue'

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
		const title = ref('bridge.')

		App.getApp().then((app) => {
			title.value = app.projectManager.title.current.value

			watch(app.projectManager.title.current, () => {
				title.value = app.projectManager.title.current.value
			})
		})

		console.log(App.toolbar.state.value)

		return {
			toolbar: App.toolbar.state.value,
			isMacOS: platform() === 'darwin',
			appVersion,
			isAnyWindowVisible: App.windowState.isAnyWindowVisible,
		}
	},
	methods: {
		async openChangelogWindow() {
			if (this.isAnyWindowVisible) return

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
	font-size: 14px;
}

.toolbar-btn {
	app-region: no-drag;
	-webkit-app-region: no-drag;
	min-width: 0;
}
.app-version-display {
	app-region: no-drag;
	-webkit-app-region: no-drag;
	cursor: pointer;
	font-size: 12px;
}
</style>
