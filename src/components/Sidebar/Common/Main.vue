<template>
	<Navigation v-if="!isVisible" app />
	<v-navigation-drawer
		v-else
		v-model="isVisible"
		stateless
		app
		width="300"
		class="app-sidebar"
		color="expandedSidebar"
	>
		<Navigation />

		<!-- 60px sidebar nav + 12px default padding -->
		<h1 style="padding: 12px; padding-left: 72px;">
			{{ t(currentSidebar.displayName) }}
		</h1>
		<v-divider />
		<div
			v-if="isVisible"
			style="padding: 4px; padding-left: 64px; height: calc(100% - 48px); overflow: auto;"
		>
			<keep-alive>
				<component :is="currentSidebarContent" />
			</keep-alive>
		</div>
	</v-navigation-drawer>
</template>

<script>
import Navigation from './Navigation'
import { setupSidebar } from '../setup'
import { SidebarState } from './state'
import { TranslationMixin } from '@/utils/locales'

export default {
	mixins: [TranslationMixin],
	components: {
		Navigation,
	},
	data: () => ({
		SidebarState,
	}),
	computed: {
		currentSidebar() {
			return SidebarState.sidebarElements[SidebarState.currentState]
		},
		isVisible: {
			get() {
				return SidebarState.currentState !== null
			},
			set() {
				//No setter required other than preventing an error log
			},
		},
		currentSidebarContent() {
			return this.currentSidebar.component
		},
	},
}
</script>

<style>
.app-sidebar > .v-navigation-drawer__content {
	overflow: hidden;
}
</style>
