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
				v-if="tabSystem"
				:is="tabSystem.currentComponent"
				:tab="tabSystem.selectedTab"
			/>
			<WelcomeScreen v-else />
			<!--  -->
		</v-main>
	</v-app>
</template>

<script>
import Vue from 'vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import Toolbar from './components/Toolbar/Main.vue'
import WindowRenderer from './components/Windows/Collect.vue'
import TabBar from './components/TabSystem/TabBar.vue'
import { platform } from './utils/os'
import { TabSystemMixin } from '@/components/Mixins/TabSystem'
import WelcomeScreen from '@/components/TabSystem/WelcomeScreen'

export default Vue.extend({
	name: 'App',
	mixins: [TabSystemMixin],

	components: {
		Sidebar,
		Toolbar,
		WindowRenderer,
		TabBar,
		WelcomeScreen,
	},

	data: () => ({
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
	border-radius: 24px;
	width: 6px;
	height: 6px;
}
*::-webkit-scrollbar-track {
	border-radius: 24px;
	box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6);
}
*::-webkit-scrollbar-thumb {
	border-radius: 24px;
	background-color: rgba(0, 0, 0, 0.4);
}

summary::-webkit-details-marker {
	display: none;
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
.v-system-bar {
	width: calc(100% + 1px);
}

.v-select-list {
	background-color: var(--v-menu-base) !important;
}
</style>
