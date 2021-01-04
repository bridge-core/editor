<template>
	<v-app>
		<Toolbar />

		<Sidebar />

		<v-main>
			<WindowRenderer />
			<TabBar />

			<component
				:is="mainTabSystem.currentComponent"
				:tab="mainTabSystem.selectedTab"
			/>
			<!--  -->
		</v-main>

		<Footer />
	</v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Sidebar from './components/Sidebar/Common/Main.vue'
import Footer from './components/Footer/Main.vue'
import Toolbar from './components/Toolbar/Main.vue'
import WindowRenderer from './components/Windows/Collect.vue'
import TabBar from './components/TabSystem/TabBar.vue'
import { startUp } from './appCycle/startUp'
import { mainTabSystem } from '@/components/TabSystem/Main'
import { App } from './App'

export default Vue.extend({
	name: 'App',

	components: {
		Sidebar,
		Footer,
		Toolbar,
		WindowRenderer,
		TabBar,
	},
	async mounted() {
		await startUp()
		App.main()
	},

	data: () => ({
		mainTabSystem,
	}),
})
</script>

<style>
/** Reset vuetify's scrolling */
html {
	overflow: hidden;
	overscroll-behavior: contain;
}
body {
	overflow: unset;
}

/** Scrollbar */
*::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}
*::-webkit-scrollbar-track {
	box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
}
*::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.35);
	box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.4);
}

/* No text selection */
:root {
	-moz-user-select: none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
</style>
