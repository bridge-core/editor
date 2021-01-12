<template>
	<SidebarWindow
		windowTitle="windows.packExplorer.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.categories"
		:selectedValue="sidebar.selected"
		@sidebarChanged="index => (sidebar.selected = index)"
	>
		<template #default="{ selectedSidebar }">
			<FileExplorer :startPath="selectedSidebar" @closeWindow="onClose" />
		</template>

		<template #toolbar>
			<v-btn icon small>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-file-plus-outline
				</v-icon>
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'
import Sidebar from './Sidebar.vue'
import FileExplorer from './FileExplorer.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
		Sidebar,
		FileExplorer,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>

<style></style>
