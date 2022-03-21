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
		:actions="actions"
		v-model="sidebar.selected"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.projectChooser.searchProjects')"
				autofocus
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
					draggable="false"
				/>
				<div>
					<h1 style="overflow-wrap: anywhere">
						{{ sidebar.currentState.name }}
					</h1>
					<h2 class="subheader">by {{ authors }}</h2>
				</div>
			</div>
			<v-row class="mb-6" dense>
				<v-col
					v-for="packType in sidebar.currentState.contains"
					:key="packType.id"
				>
					<PackTypeViewer style="height: 100%" :packType="packType" />
				</v-col>
			</v-row>

			<h2 class="subheader">{{ t('general.experimentalGameplay') }}</h2>
			<v-row dense>
				<v-col
					v-for="experiment in sidebar.currentState
						.experimentalGameplay"
					:key="`${experiment.id}.${experiment.isActive}`"
					xs="12"
					sm="6"
					md="4"
					lg="3"
					xl="2"
				>
					<ExperimentalGameplay
						:experiment="experiment"
						:isToggleable="false"
						:value="experiment.isActive"
						style="height: 100%"
					/>
				</v-col>
			</v-row>
		</template>

		<template #actions="{ selectedSidebar }">
			<v-btn
				color="primary"
				:disabled="currentProject !== selectedSidebar"
				@click="onAddPack"
			>
				<v-icon class="mr-1">mdi-plus-box</v-icon>
				{{ t('windows.projectChooser.addPack') }}
			</v-btn>

			<v-spacer />
			<v-btn
				color="error"
				:disabled="currentProject === selectedSidebar"
				@click="onDeleteProject(selectedSidebar)"
			>
				<v-icon>mdi-delete</v-icon>
				{{ t('general.delete') }}
			</v-btn>
			<v-btn
				color="primary"
				:disabled="currentProject === selectedSidebar"
				@click="onSelectProject"
			>
				<v-icon>mdi-check</v-icon>
				{{ t('general.select') }}
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import PackTypeViewer from '/@/components/Data/PackTypeViewer.vue'
import ExperimentalGameplay from '/@/components/Projects/CreateProject/ExperimentalGameplay.vue'

import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow.ts'
import { addPack } from './AddPack'

let formatter
if ('ListFormat' in Intl) {
	formatter = new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction',
	})
} else {
	formatter = {
		format: (arr) => arr.join(', '),
	}
}

export default {
	name: 'ProjectChooserWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
		PackTypeViewer,
		ExperimentalGameplay,
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
		onDeleteProject(projectName) {
			new ConfirmationWindow({
				description: 'windows.deleteProject.description',
				confirmText: 'windows.deleteProject.confirm',
				cancelText: 'general.cancel',
				onConfirm: async () => {
					const app = await App.getApp()
					await app.projectManager.removeProject(projectName)
					await this.currentWindow.loadProjects()
				},
			})
		},
		onAddPack() {
			addPack()
			this.currentWindow.close()
		},
	},
	computed: {
		authors() {
			const authors = this.sidebar.currentState.authors || 'Unknown'
			if (Array.isArray(authors)) return formatter.format(authors)
			return authors
		},
	},
}
</script>

<style scoped>
.project-logo {
	image-rendering: pixelated;
}
.content-area {
	background-color: rgb(var(--v-theme-sidebarNavigation));
}
.subheader {
	font-size: 1.25rem !important;
	font-weight: 500;
	letter-spacing: 0.0125em !important;
}
</style>
