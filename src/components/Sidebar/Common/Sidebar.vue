<template>
	<v-navigation-drawer
		mini-variant
		mini-variant-width="60"
		stateless
		:value="true"
		:app="app"
		absolute
		color="sidebarNavigation"
	>
		<v-list>
			<SidebarButton
				v-for="(sidebar, uuid) in SidebarState.sidebarElements"
				:key="`${SidebarState.currentState}.${uuid}`"
				:displayName="sidebar.displayName"
				:icon="sidebar.icon"
				:opacity="sidebar.opacity"
				:isSelected="sidebar.isSelected"
				@click="sidebar.click()"
			/>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import SidebarButton from './Button'
import { SidebarState, getSelected } from './state'

export default {
	name: 'Sidebar',
	props: {
		app: Boolean,
	},
	components: {
		SidebarButton,
	},
	data() {
		return {
			SidebarState,
		}
	},
}
</script>

<style></style>
