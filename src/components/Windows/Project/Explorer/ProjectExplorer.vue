<template>
	<BaseWindow
		windowTitle="windows.packExplorer.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
	>
		<template #sidebar>
			<Sidebar
				:sidebarSelection="sidebar.selection"
				@sidebarChanged="onSidebarChanged"
			/>
		</template>
		<template #default>
			<FileExplorer
				:startPath="sidebar.selection"
				@closeWindow="onClose"
			/>
		</template>

		<template #toolbar>
			<v-btn icon small>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-file-plus-outline
				</v-icon>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow.vue'
import Sidebar from './Sidebar.vue'
import FileExplorer from './FileExplorer.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
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
		onSidebarChanged(fileType) {
			this.sidebar.selection = fileType
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
