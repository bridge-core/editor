<template>
	<v-system-bar
		color="toolbar"
		fixed
		app
		clipped
		padless
		:height="appToolbarHeight"
		:style="{
			'padding-left': 0,
			'margin-left': 'env(titlebar-area-x, 0)',
			width: 'env(titlebar-area-width, 100%)',
			'z-index': windowControlsOverlay ? 1000 : undefined,
		}"
	>
		<Logo
			v-if="!isMacOS || !windowControlsOverlay"
			style="height: 20px; padding-right: 4px; padding-left: 8px"
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
			v-ripple="!isAnyWindowVisible"
			:style="{ opacity: isAnyWindowVisible ? 0.4 : null }"
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
import { platform } from '/@/utils/os.ts'
import { reactive } from '@vue/composition-api'
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
		const setupObj = reactive({
			title: 'bridge.',
			isAnyWindowVisible: App.windowState.isAnyWindowVisible,
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
	}),
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
