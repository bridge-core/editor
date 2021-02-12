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
			<div class="d-flex mb-4">
				<img
					class="pr-4 project-logo"
					height="64"
					:src="sidebar.currentState.imgSrc"
				/>
				<div>
					<h1>{{ sidebar.currentState.name }}</h1>
					<h3>by {{ sidebar.currentState.author || 'Unknown' }}</h3>
				</div>
			</div>
			<div>
				<h4>Contains:</h4>
				<v-chip
					v-for="pack in sidebar.currentState.contains"
					:key="pack.id"
					:color="pack.color"
					small
					class="mr-2"
				>
					{{ pack.id }}
				</v-chip>
			</div>
		</template>

		<template #actions="{ selectedSidebar }">
			<v-spacer />
			<v-btn
				color="error"
				:disabled="currentProject === selectedSidebar"
				@click="onDeleteProject(selectedSidebar)"
			>
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
				Select
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'
import ToolbarButton from '@/components/Windows/Layout/Toolbar/Button.vue'

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
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
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
		createProject() {
			this.currentWindow.close()
			App.instance.windows.createProject.open()
		},
		onDeleteProject(projectName) {
			createConfirmWindow(
				'windows.deleteProject.description',
				'windows.deleteProject.confirm',
				'windows.deleteProject.cancel',
				() => {
					App.ready.once(async app => {
						await app.fileSystem.unlink(`projects/${projectName}`)
						await this.window.loadProjects()
					})
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
</style>
