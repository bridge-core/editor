<template>
	<SidebarWindow
		windowTitle="windows.packExplorer.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		v-model="sidebar.selected"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.packExplorer.searchFiles')"
				outlined
				dense
			/>
		</template>
		<template #default="{ selectedSidebar }">
			<!-- <v-btn absolute bottom right color="primary" elevation="4" fab>
				<v-icon small>
					mdi-file-plus-outline
				</v-icon>
			</v-btn> -->
			<FileExplorer :startPath="selectedSidebar" @closeWindow="onClose" />
		</template>

		<template #toolbar>
			<v-btn icon small>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-plus
				</v-icon>
			</v-btn>
			<v-btn @click="refreshPackExplorer" icon small>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-refresh
				</v-icon>
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'
import FileExplorer from './FileExplorer.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'
import { selectedProject } from '@/components/Project/Loader'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
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
		refreshPackExplorer() {
			this.currentWindow.close()
			App.instance.switchProject(selectedProject)
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
