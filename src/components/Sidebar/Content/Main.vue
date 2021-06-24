<template>
	<div
		v-if="content"
		class="pa-2"
		:style="{
			height: `calc(${windowDimensions.currentHeight}px - env(titlebar-area-height, 24px))`,
		}"
	>
		<BridgeSheet :style="{ height: '100%', overflow: 'auto' }">
			<ActionBar
				v-if="content.actions && content.actions.length > 0"
				:actions="content.actions"
			/>
			<component :is="content.component" />
		</BridgeSheet>
	</div>
</template>

<script>
import { SidebarState } from '../state'
import ActionBar from './ActionBar.vue'
import { App } from '/@/App'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export default {
	components: {
		BridgeSheet,
		ActionBar,
	},
	mounted() {
		App.getApp().then(
			(app) => (this.windowDimensions = app.windowResize.state)
		)
	},
	data: () => ({
		SidebarState,
		windowDimensions: {},
	}),
	computed: {
		content() {
			return this.SidebarState.currentState
		},
	},
}
</script>

<style></style>
