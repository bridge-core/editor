<template>
	<div>
		<ActionViewer
			v-for="(sidebar, id) in sidebarElements"
			:key="id"
			:selected="sidebar.isVisibleSetting"
			:action="{ ...sidebar.config, name: sidebar.displayName }"
			hideTriggerButton
			v-ripple
			@click.native="onClick(sidebar)"
		/>
	</div>
</template>

<script>
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { settingsState } from '../../SettingsState'
import { App } from '/@/App'

export default {
	setup() {
		return {
			sidebarElements: App.sidebar.elements,
		}
	},
	components: {
		ActionViewer,
	},
	methods: {
		onClick(sidebar) {
			sidebar.isVisibleSetting = !sidebar.isVisibleSetting

			if (!settingsState.sidebar) settingsState.sidebar = {}
			if (!settingsState.sidebar.sidebarElements)
				settingsState.sidebar.sidebarElements = {}

			settingsState.sidebar.sidebarElements[sidebar.uuid] =
				sidebar.isVisibleSetting
		},
	},
}
</script>
