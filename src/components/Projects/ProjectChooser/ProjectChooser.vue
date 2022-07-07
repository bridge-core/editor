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
				class="pt-2 mb-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.projectChooser.searchProjects')"
				hide-details
				autofocus
				v-model.lazy.trim="sidebar._filter"
				outlined
				dense
			/>
			<v-btn
				v-if="showLoadAllButton"
				:loading="showLoadAllButton === 'isLoading'"
				@click="onLoadAllProjects"
				class="mb-2"
				block
				color="primary"
			>
				<v-icon class="mr-1">mdi-folder-open-outline</v-icon>
				{{ t('windows.projectChooser.loadAllProjects') }}
			</v-btn>
		</template>
		<template #default>
			<div class="d-flex align-center mb-4 rounded-lg content-area pa-4">
				<div class="d-flex align-center">
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

				<v-spacer />

				<!-- Show that project is local project -->
				<v-tooltip
					v-if="sidebar.currentState.isLocalProject"
					color="tooltip"
					bottom
				>
					<template v-slot:activator="{ on }">
						<BridgeSheet
							v-on="on"
							dark
							class="d-flex flex-column pa-2"
						>
							<v-icon color="primary"
								>mdi-lock-open-outline</v-icon
							>
							{{ t('windows.projectChooser.localProject.name') }}
						</BridgeSheet>
					</template>

					<span>
						{{
							t('windows.projectChooser.localProject.description')
						}}
					</span>
				</v-tooltip>

				<!-- Show that project is com.mojang project -->
				<v-tooltip v-if="isComMojangProject" color="tooltip" bottom>
					<template v-slot:activator="{ on }">
						<BridgeSheet
							v-on="on"
							dark
							class="d-flex flex-column pa-2"
						>
							<v-icon color="primary">mdi-minecraft</v-icon>
							{{
								t(
									'windows.projectChooser.comMojangProject.name'
								)
							}}
						</BridgeSheet>
					</template>

					<span>
						{{
							t(
								'windows.projectChooser.comMojangProject.description'
							)
						}}
					</span>
				</v-tooltip>
			</div>
			<!-- Show available packs -->
			<v-row class="mb-6" dense>
				<v-col
					v-for="packType in sidebar.currentState.contains"
					:key="packType.id"
				>
					<PackTypeViewer style="height: 100%" :packType="packType" />
				</v-col>
			</v-row>

			<template v-if="!isComMojangProject">
				<!-- Show experimental gameplay -->
				<h2 class="subheader">
					{{ t('general.experimentalGameplay') }}
				</h2>
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
		</template>

		<template #actions="{ selectedSidebar }">
			<v-btn
				v-if="!isComMojangProject"
				color="primary"
				:disabled="currentProject !== selectedSidebar"
				@click="onAddPack"
			>
				<v-icon class="mr-1">mdi-plus-box</v-icon>
				{{ t('windows.projectChooser.addPack') }}
			</v-btn>

			<v-spacer />
			<v-btn
				v-if="!isComMojangProject"
				color="error"
				:disabled="currentProject === selectedSidebar"
				@click="onDeleteProject(selectedSidebar)"
			>
				<v-icon>mdi-delete</v-icon>
				{{ t('general.delete') }}
			</v-btn>
			<!-- Select Project -->
			<v-btn
				v-if="isComMojangProject"
				color="primary"
				@click="onSelectProject"
			>
				<v-icon>mdi-folder-open-outline</v-icon>
				{{ t('windows.projectChooser.openPacks') }}
			</v-btn>
			<v-btn
				v-else
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
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow.ts'
import { addPack } from './AddPack'
import { virtualProjectName } from '../Project/Project'

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
		BridgeSheet,
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

			if (this.isComMojangProject) {
				await app.projectManager.selectProject(virtualProjectName)
				this.sidebar.currentState.openHandles.map((handle) =>
					app.viewFolders.addDirectoryHandle(handle)
				)
			} else {
				app.projectManager.selectProject(this.sidebar.selected)
			}

			this.currentWindow.close()
		},
		onDeleteProject(projectName) {
			new ConfirmationWindow({
				description: 'windows.deleteProject.description',
				confirmText: 'windows.deleteProject.confirm',
				cancelText: 'general.cancel',
				onConfirm: async () => {
					const app = await App.getApp()
					await app.projectManager.removeProjectWithName(projectName)

					if (app.hasNoProjects) this.onClose()
					else await this.currentWindow.loadProjects()
				},
			})
		},
		onAddPack() {
			addPack()
			this.currentWindow.close()
		},
		onLoadAllProjects() {
			this.currentWindow.loadAllProjects()
		},
	},
	computed: {
		authors() {
			const authors = this.sidebar.currentState.authors || 'Unknown'
			if (Array.isArray(authors))
				return formatter.format(
					authors.map((author) =>
						typeof author === 'string' ? author : author.name
					)
				)
			return authors
		},
		isComMojangProject() {
			return this.sidebar.currentState.isComMojangProject
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
.subheader {
	font-size: 1.25rem !important;
	font-weight: 500;
	letter-spacing: 0.0125em !important;
}
</style>
