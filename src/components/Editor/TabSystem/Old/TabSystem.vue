<template>
	<div
		v-if="tabSystem && tabSystem.shouldRender.value"
		:style="{
			'margin-right': '1px',
			width: isMobile ? '100%' : 'calc(50% - 100px)',
			height: isMobile ? '50%' : '100%',
		}"
	>
		<TabBar :id="id" />
		<keep-alive>
			<component
				:is="tabSystem.currentComponent"
				:key="`${tabSystem.uuid}.${
					tabSystem.currentComponent.name ||
					(tabSystem.selectedTab || {}).type ||
					(tabSystem.selectedTab || {}).name
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
import { useTabSystem } from '../Composables/UseTabSystem'
import { toRefs, watch } from 'vue'

export default {
	name: 'TabSystem',
	mixins: [AppToolbarHeightMixin],
	props: {
		id: {
			type: Number,
			default: 0,
		},
	},
	setup(props) {
		const { id } = toRefs(props)
		const { tabSystem } = useTabSystem(id)

		watch(tabSystem, () => {
			if (!tabSystem.value) return

			watch(tabSystem.value.shouldRender, () => {
				App.getApp().then((app) => app.windowResize.dispatch())
			})
		})

		return {
			tabSystem,
		}
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
		app.windowResize.dispatch()
	},
	computed: {
		tabBarHeight() {
			if (!this.tabSystem?.selectedTab) return 0
			return this.tabSystem?.selectedTab.actions.length > 0 ? 48 + 25 : 48
		},
		tabHeight() {
			return (
				(this.windowHeight - this.appToolbarHeightNumber) /
					(this.tabSystem?.isSharingScreen.value && this.isMobile
						? 2
						: 1) -
				this.tabBarHeight -
				App.bottomPanel.currentHeight.value
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
}
</script>
