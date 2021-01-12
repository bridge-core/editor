<template>
	<BaseWindow
		windowTitle="windows.packExplorer"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
	>
		<template #sidebar>
			<Sidebar @sidebarChanged="onSidebarChanged" />
		</template>
		<template #default>
			<FileExplorer :startPath="sidebarSelection" />
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
		openLink() {
			window.open(this.plugin.link, '_blank')
		},
		done() {
			this.currentWindow.close()
		},
		onSidebarChanged(fileType) {
			this.sidebarSelection = fileType
		},
	},
}
</script>

<style></style>
