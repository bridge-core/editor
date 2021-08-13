<template>
	<div
		v-if="content"
		class="pa-2"
		:style="{
			height: `calc(${windowDimensions.currentHeight}px - ${appToolbarHeight})`,
		}"
	>
		<BridgeSheet :style="{ height: '100%', overflow: 'auto' }">
			<InfoPanel
				v-if="content.topPanel"
				class="ma-2"
				:infoPanel="content.topPanel"
			/>

			<ActionBar
				v-if="content.actions && content.actions.length > 0"
				:actions="content.actions"
			/>

			<component :is="content.component" :sidebarContent="content" />
		</BridgeSheet>
	</div>
</template>

<script>
import { SidebarState } from '../state'
import ActionBar from './ActionBar.vue'
import { App } from '/@/App'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'

export default {
	mixins: [AppToolbarHeightMixin],
	components: {
		BridgeSheet,
		ActionBar,
		InfoPanel,
	},

	mounted() {
		App.getApp().then((app) => {
			this.windowDimensions = app.windowResize.state
		})
	},
	data: () => ({
		SidebarState,
		windowDimensions: { currentHeight: window.innerHeight },
	}),
	computed: {
		content() {
			return this.SidebarState.currentState
		},
	},
}
</script>
