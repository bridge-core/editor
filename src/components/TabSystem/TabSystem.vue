<template>
	<div
		v-if="tabSystem.shouldRender"
		:style="{
			'margin-right': '1px',
			width: isMobile ? '100%' : 'calc(50% - 100px)',
			height: isMobile ? '50%' : '100%',
		}"
	>
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
					tabSystem.currentComponent.name ||
					tabSystem.selectedTab.type ||
					tabSystem.selectedTab.name
				}`"
				:style="`height: ${tabHeight}px; width: 100%;`"
				:height="tabHeight"
				:tab="tabSystem.selectedTab"
				:id="id"
			/>
		</keep-alive>
	</div>
</template>

<script>
import TabBar from '/@/components/TabSystem/TabBar.vue'
import { App } from '/@/App'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight'

export default {
	name: 'TabSystem',
	mixins: [AppToolbarHeightMixin],
	props: {
		tabSystem: Object,
		id: {
			type: Number,
			default: 0,
		},
	},
	components: {
		TabBar,
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
		tabHeight() {
			return (
				(this.windowHeight - this.appToolbarHeightNumber) /
					(this.tabSystem.isSharingScreen && this.isMobile ? 2 : 1) -
				this.tabBarHeight
			)
		},
		isMobile() {
			return this.$vuetify.breakpoint.mobile
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
