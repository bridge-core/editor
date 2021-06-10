<template>
	<div v-if="tabSystem.shouldRender" class="tab-system">
		<TabBar :tabSystem="tabSystem" />
		<v-progress-linear
			v-if="tabSystem.selectedTab && tabSystem.selectedTab.isLoading"
			absolute
			indeterminate
		/>
		<keep-alive>
			<component
				:is="tabSystem.currentComponent"
				:key="`${tabSystem.uuid}.${
					tabSystem.selectedTab
						? tabSystem.selectedTab.uuid
						: undefined
				}.${tabSystem.currentComponent.name}`"
				:style="`height: ${
					windowHeight -
					(tabBarHeight + (windowControlsOverlay ? 33 : 24))
				}px; width: 100%;`"
				:height="
					windowHeight -
					(tabBarHeight + (windowControlsOverlay ? 33 : 24))
				"
				:tab="tabSystem.selectedTab"
				:id="id"
			/>
		</keep-alive>
	</div>
</template>

<script>
import WelcomeScreen from '/@/components/TabSystem/WelcomeScreen.vue'
import TabBar from '/@/components/TabSystem/TabBar.vue'
import { App } from '/@/App'
import { WindowControlsOverlayMixin } from '/@/components/Mixins/WindowControlsOverlay'

export default {
	name: 'TabSystem',
	mixins: [WindowControlsOverlayMixin],
	props: {
		tabSystem: Object,
		id: {
			type: Number,
			default: 0,
		},
	},
	components: {
		TabBar,
		WelcomeScreen,
	},
	data: () => ({
		windowHeight: window.innerHeight,
	}),
	async mounted() {
		const app = await App.getApp()
		app.windowResize.on(this.updateWindowHeight)
	},
	async destroyed() {
		const app = await App.getApp()
		app.windowResize.off(this.updateWindowHeight)
	},
	computed: {
		tabBarHeight() {
			return this.tabSystem.selectedTab &&
				this.tabSystem.selectedTab.actions.length > 0
				? 48 + 25
				: 48
		},
	},
	methods: {
		updateWindowHeight() {
			this.windowHeight = window.innerHeight
		},
	},
	watch: {
		'tabSystem.shouldRender'() {
			App.getApp().then((app) => app.windowResize.dispatch())
		},
	},
}
</script>

<style scoped>
.tab-system {
	display: inline;
	width: 50%;
	height: 100%;
}
</style>
