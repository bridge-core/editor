<template>
	<div>
		<ActionViewer
			v-for="(sidebar, id) in sidebarState"
			:key="id"
			:selected="sidebar.isVisible"
			:action="{ ...sidebar.config, name: sidebar.displayName }"
			hideTriggerButton
			v-ripple
			@click.native="onClick(sidebar)"
		/>
	</div>
</template>

<script>
import { SidebarState } from '/@/components/Sidebar/state.ts'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { settingsState } from '../../SettingsState'

export default {
	data: () => ({
		sidebarState: SidebarState.sidebarElements,
	}),
	components: {
		ActionViewer,
	},
	methods: {
		onClick(sidebar) {
			sidebar.isVisible = !sidebar.isVisible

			if (!settingsState.sidebar) settingsState.sidebar = {}
			if (!settingsState.sidebar.sidebarElements)
				settingsState.sidebar.sidebarElements = {}

			settingsState.sidebar.sidebarElements[sidebar.uuid] =
				sidebar.isVisible
		},
	},
}
</script>
