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

		<v-list v-if="hasVisibleNotifications">
			<v-divider class="mx-3 mb-6" />
			<template v-for="notification in NotificationStore">
				<SidebarButton
					v-if="notification.isVisible"
					:key="notification.id"
					:displayName="notification.message"
					:icon="notification.icon"
					:color="notification.color"
					:iconColor="notification.textColor"
					@click="notification.onClick()"
				/>
			</template>
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
					:value="task.progress"
				/>
			</SidebarButton>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import { settingsState } from '/@/components/Windows/Settings/SettingsState.ts'
import SidebarButton from './Button.vue'
import { SidebarState } from './state.ts'
import { tasks } from '/@/components/TaskManager/TaskManager.ts'
import { NotificationStore } from '/@/components/Notifications/state.ts'

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
		hasVisibleNotifications() {
			return Object.values(this.NotificationStore).some(
				({ isVisible }) => isVisible
			)
		},
		isSidebarRight() {
			return (
				this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.isSidebarRight
			)
		},
	},
}
</script>
