<template>
	<v-app>
		<!-- We need access to native menus in order to hide the custom one on MacOS -->
		<!-- <Toolbar v-if="!isMacOs" /> -->
		<Toolbar />

		<Sidebar app />

		<v-main>
			<WindowRenderer />
			<TabBar />

			<component
				:is="mainTabSystem.currentComponent"
				:tab="mainTabSystem.selectedTab"
			/>
			<!--  -->
		</v-main>

		<!-- <Footer /> -->
	</v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Sidebar from './components/Sidebar/Common/Sidebar.vue'
import Footer from './components/Footer/Main.vue'
import Toolbar from './components/Toolbar/Main.vue'
import WindowRenderer from './components/Windows/Collect.vue'
import TabBar from './components/TabSystem/TabBar.vue'
import { mainTabSystem } from '@/components/TabSystem/Main'
import { App } from './App'
import { platform } from './utils/os'

export default Vue.extend({
	name: 'App',

	components: {
		Sidebar,
		Footer,
		Toolbar,
		WindowRenderer,
		TabBar,
	},

	data: () => ({
		mainTabSystem,
		isMacOs: platform() === 'darwin',
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

.v-application {
	background: var(--v-background-base) !important;
}

.v-system-bar .v-icon {
	margin-right: 0;
}
</style>
