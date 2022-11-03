<template>
	<v-navigation-drawer
		mini-variant
		mini-variant-width="60"
		stateless
		v-model="isNavigationVisible"
		:app="app"
		absolute
		floating
		:right="isSidebarRight"
		color="sidebarNavigation"
		:height="`calc(100% - ${appToolbarHeight})`"
		:class="{
			'rounded-r-lg': !isSidebarRight,
			'rounded-l-lg': isSidebarRight,
		}"
		class="my-2"
		:style="{
			maxHeight: `calc(100% - ${appToolbarHeight} - 16px)`,
			top: appToolbarHeight,
		}"
	>
		<template v-if="isMobile">
			<div
				class="d-flex align-center justify-center mt-3 mb-2 mx-1 rounded-lg"
				v-ripple
			>
				<BridgeLogo :height="32" @click.native="openChangelogWindow" />
			</div>

			<SidebarButton
				displayName="general.close"
				icon="mdi-close"
				color="error"
				@click="closeSidebar"
			/>
			<SidebarButton
				displayName="actions.name"
				icon="mdi-menu"
				@click="showMobileMenu"
			/>
		</template>

		<v-list>
			<SidebarButton
				v-for="(sidebar, i) in sidebarElements"
				:key="`${sidebar.uuid}//${i}`"
				:displayName="sidebar.displayName"
				:icon="sidebar.icon"
				:isLoading="sidebar.isLoading"
				:isSelected="sidebar.isSelected"
				:badge="sidebar.badge"
				:disabled="sidebar.isDisabled"
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
					@middleClick="notification.onMiddleClick()"
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
import BridgeLogo from '/@/components/UIElements/Logo.vue'
import { settingsState } from '/@/components/Windows/Settings/SettingsState.ts'
import SidebarButton from './Button.vue'
import { tasks } from '/@/components/TaskManager/TaskManager.ts'
import { NotificationStore } from '/@/components/Notifications/state.ts'
import { AppToolbarHeightMixin } from '/@/components/Mixins/AppToolbarHeight.ts'
import { App } from '/@/App'
import { version as appVersion } from '/@/utils/app/version'

export default {
	name: 'Sidebar',
	mixins: [AppToolbarHeightMixin],
	props: {
		app: Boolean,
	},
	components: {
		SidebarButton,
		BridgeLogo,
	},

	setup() {
		return {
			rawSidebarElements: App.sidebar.sortedElements,
			rawIsNavigationVisible: App.sidebar.isNavigationVisible,
			appVersion,
		}
	},
	data() {
		return {
			settingsState,
			tasks,
			NotificationStore,
		}
	},
	computed: {
		isMobile() {
			return this.$vuetify.breakpoint.mobile
		},
		isNavigationVisible: {
			get() {
				return !this.isMobile || App.sidebar.isNavigationVisible.value
			},
			set(val) {
				App.sidebar.isNavigationVisible.value = val
			},
		},
		sidebarElements() {
			return this.rawSidebarElements.filter(
				(sidebar) => sidebar.isVisible
			)
		},
		hasVisibleNotifications() {
			return Object.values(this.NotificationStore).some(
				({ isVisible }) => isVisible
			)
		},
		isSidebarRight() {
			return (
				this.settingsState &&
				this.settingsState.sidebar &&
				this.settingsState.sidebar.isSidebarRight
			)
		},
	},
	methods: {
		closeSidebar() {
			App.sidebar.isNavigationVisible.value = false
		},
		showMobileMenu(event) {
			App.toolbar.showMobileMenu(event)
		},
		async openChangelogWindow() {
			const app = await App.getApp()
			await app.windows.changelogWindow.open()
		},
	},
}
</script>
