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
		<template #toolbar>
			<ToolbarButton @click="createProject" icon="mdi-plus" />
		</template>

		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.projectChooser.searchProjects')"
				v-model="sidebar._filter"
				outlined
				dense
			/>
		</template>
		<template #default>
			<div class="d-flex align-center mb-4 rounded-lg content-area pa-4">
				<img
					class="mr-2 project-logo rounded-lg"
					height="64"
					:src="sidebar.currentState.imgSrc"
				/>
				<div>
					<h1 class="text-h4">{{ sidebar.currentState.name }}</h1>
					<h2 class="text-h6">
						by {{ sidebar.currentState.author || 'Unknown' }}
					</h2>
				</div>
			</div>
			<div class="d-flex">
				<PackTypeViewer
					v-for="(packType, i) in sidebar.currentState.contains"
					:key="packType.id"
					:packType="packType"
					:class="{
						'mr-1': i === 0,
						'ml-1': i + 1 === sidebar.currentState.contains.length,
						'mx-1':
							i > 0 &&
							i + 1 < sidebar.currentState.contains.length,
					}"
				/>
			</div>
		</template>

		<template #actions="{ selectedSidebar }">
			<v-spacer />
			<v-btn
				color="error"
				:disabled="currentProject === selectedSidebar"
				@click="onDeleteProject(selectedSidebar)"
			>
				<v-icon>mdi-delete</v-icon>
				Delete
			</v-btn>
			<v-btn
				color="primary"
				:disabled="currentProject === selectedSidebar"
				:loading="
					currentProject !== selectedSidebar &&
						(!isPackIndexerReady || !isCompilerReady)
				"
				@click="onSelectProject"
			>
				<v-icon>mdi-check</v-icon>
				Select
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'
import ToolbarButton from '@/components/Windows/Layout/Toolbar/Button.vue'
import PackTypeViewer from '@/components/Data/PackTypeViewer.vue'

import { App } from '@/App'
import { TranslationMixin } from '@/utils/locales'
import { createConfirmWindow } from '@/components/Windows/Common/CommonDefinitions'
import { PackIndexerMixin } from '@/components/Mixins/Tasks/PackIndexer'
import { CompilerMixin } from '@/components/Mixins/Tasks/Compiler'

export default {
	name: 'ProjectChooserWindow',
	mixins: [TranslationMixin, PackIndexerMixin, CompilerMixin],
	components: {
		SidebarWindow,
		ToolbarButton,
		PackTypeViewer,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		async onSelectProject() {
			const app = await App.getApp()
			app.projectManager.selectProject(this.sidebar.selected)
			this.currentWindow.close()
		},
		async createProject() {
			const app = await App.getApp()
			this.currentWindow.close()
			app.windows.createProject.open()
		},
		onDeleteProject(projectName) {
			createConfirmWindow(
				'windows.deleteProject.description',
				'windows.deleteProject.confirm',
				'windows.deleteProject.cancel',
				async () => {
					const app = await App.getApp()
					await app.projectManager.removeProject(projectName)
					await this.currentWindow.loadProjects()
				}
			)
		},
	},
}
</script>

<style scoped>
.project-logo {
	image-rendering: pixelated;
}
.content-area {
	background-color: var(--v-sidebarNavigation-base);
}
</style>
