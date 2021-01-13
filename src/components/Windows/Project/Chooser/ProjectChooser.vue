<template>
	<SidebarWindow
		windowTitle="windows.projectChooser.title"
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
				:label="t('windows.projectChooser.searchProjects')"
				v-model="sidebar.filter"
				outlined
				dense
			/>
		</template>
		<template #default="{ selectedSidebar }">
			{{ selectedSidebar }}
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="onSelectProject">Select</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'
import { selectProject } from '@/components/Project/Loader'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onSelectProject() {
			selectProject(this.sidebar.selected)
			this.currentWindow.close()
		},
	},
}
</script>

<style></style>
