<template>
	<v-system-bar color="toolbar" fixed app clipped padless height="24px">
		<img
			style="height: 20px; padding-right: 4px"
			alt="bridge. Logo"
			src="/@/_assets/logo.svg"
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
					@click="() => item.trigger()"
				/>
				<MenuActivator v-else :key="`activator.${key}`" :item="item" />
				<v-divider
					:key="`divider.${key}`"
					v-if="i + 1 < Object.keys(toolbar).length"
					vertical
				/>
			</template>
		</v-toolbar-items>

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

export default {
	name: 'Toolbar',
	components: {
		WindowAction,
		MenuActivator,
		MenuButton,
	},
	data: () => ({
		toolbar: App.toolbar.state,

		appVersion,
	}),
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
	-webkit-app-region: drag;
	padding-right: 0;
}

.toolbar-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
}
.app-version-display {
	cursor: pointer;
	font-size: 12px;
}
</style>
