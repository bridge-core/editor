<template>
	<v-navigation-drawer
		mini-variant
		mini-variant-width="60"
		stateless
		:value="true"
		:app="app"
		absolute
		:right="isSidebarRight"
		color="sidebarNavigation"
	>
		<v-list>
			<SidebarButton
				v-for="(sidebar, uuid) in SidebarState.sidebarElements"
				:key="`${uuid}`"
				:displayName="sidebar.displayName"
				:icon="sidebar.icon"
				:isLoading="sidebar.isLoading"
				@click="sidebar.click()"
			/>
		</v-list>

		<v-list v-if="Object.keys(NotificationStore).length > 0">
			<v-divider class="mx-3 mb-6" />
			<SidebarButton
				v-for="(notification, i) in NotificationStore"
				:key="`${i}`"
				:displayName="notification.message"
				:icon="notification.icon"
				:color="notification.color"
				@click="notification.onClick()"
			/>
		</v-list>

		<v-list v-if="tasks.length > 0">
			<v-divider class="mx-3 mb-6" />
			<SidebarButton
				v-for="(task, i) in tasks"
				:key="`${i}`"
				:displayName="task.name"
				:icon="task.icon"
				color="primary"
				isLoading
				alwaysAllowClick
				@click="task.createWindow()"
			>
				<v-progress-circular
					rotate="-90"
					size="24"
					width="2"
					color="white"
					:value="(task.currentStepCount / task.totalStepCount) * 100"
				/>
			</SidebarButton>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import { settingsState } from '@/components/Windows/Settings/SettingsState'
import SidebarButton from './Button'
import { SidebarState, getSelected } from './state'
import { tasks } from '@/components/TaskManager/TaskManager'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'
import { NotificationStore } from '@/components/Notifications/state'

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
			settingsState,
			tasks,
			NotificationStore,
		}
	},
	computed: {
		isSidebarRight() {
			return (
				this.settingsState &&
				this.settingsState.general &&
				this.settingsState.general.isSidebarRight
			)
		},
	},
}
</script>

<style></style>
