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
				v-model="sidebar._filter"
				outlined
				dense
			/>
		</template>
		<template #default="{ selectedSidebar }">
			<FileDisplayer
				v-if="sidebar.currentElement.kind === 'directory'"
				:key="selectedSidebar"
				:startPath="
					selectedSidebar ? selectedSidebar.split('/') : undefined
				"
				@closeWindow="onClose"
			/>

			<div class="body-1" v-else>
				<strong>File:</strong> {{ selectedSidebar }}
				<div class="mt-8 d-flex">
					<v-spacer />
					<v-btn color="primary" @click="openFile(selectedSidebar)"
						>Open</v-btn
					>
				</div>
			</div>
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
import FileDisplayer from './FileDisplayer.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'
import { selectedProject } from '@/components/Project/Loader'
import { mainTabSystem } from '@/components/TabSystem/Main'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
		FileDisplayer,
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
			App.instance.switchProject(selectedProject, true)
		},
		openFile(filePath) {
			this.currentWindow.close()
			mainTabSystem.open(`projects/${selectedProject}/${filePath}`)
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
