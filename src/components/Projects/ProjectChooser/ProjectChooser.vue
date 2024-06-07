<template>
	<SidebarWindow
		windowTitle="windows.projectChooser.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		:actions="state.actions"
		:isLoading="state.isLoading"
		v-model="sidebar.selected"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2 mb-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.projectChooser.searchProjects')"
				hide-details
				autofocus
				v-model.lazy.trim="sidebar.filter"
				outlined
				dense
				spellcheck="false"
			/>
			<v-btn
				v-if="state.showLoadAllButton"
				:loading="state.showLoadAllButton === 'isLoading'"
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
			<div class="d-flex align-center mb-4 rounded content-area pa-4">
				<div class="d-flex align-center">
					<img
						class="mr-2 h-16 project-logo rounded"
						:src="sidebar.currentState.imgSrc"
						draggable="false"
					/>
					<div>
						<h1
							class="text-3xl font-semibold"
							style="overflow-wrap: anywhere"
						>
							{{ sidebar.currentState.displayName }}
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
							<v-icon color="primary">
								mdi-lock-open-outline
							</v-icon>
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
							:isToggleable="true"
							:value="experiment.isActive"
							:isInProjectChooser="true"
							@click.native="onToggleExperiment(experiment)"
							style="height: 100%"
						/>
					</v-col>
				</v-row>
			</template>

			<!-- Warn about uninstalling Minecraft -->
			<BridgeSheet
				v-if="isComMojangProject"
				class="d-flex align-center justify-center pa-2"
			>
				<v-icon class="mr-1" color="error">
					mdi-alert-circle-outline
				</v-icon>
				{{
					t(
						'windows.projectChooser.comMojangProject.uninstallWarning'
					)
				}}
			</BridgeSheet>
		</template>

		<template #actions="{ selectedSidebar }">
			<v-btn
				v-if="!isComMojangProject"
				color="primary"
				:disabled="
					state.currentProject !== selectedSidebar || state.isLoading
				"
				@click="onAddPack"
			>
				<v-icon class="mr-1">mdi-plus-box</v-icon>
				{{ t('windows.projectChooser.addPack') }}
			</v-btn>

			<v-spacer />
			<v-btn
				v-if="!isComMojangProject"
				color="error"
				:loading="deletePending"
				:disabled="state.isLoading"
				@click="onDeleteProject(selectedSidebar)"
			>
				<v-icon>mdi-delete</v-icon>
				{{ t('general.delete') }}
			</v-btn>

			<!-- Select Project -->
			<v-btn
				color="primary"
				:disabled="
					state.currentProject === selectedSidebar || state.isLoading
				"
				@click="onSelectProject"
			>
				<v-icon>mdi-check</v-icon>
				{{ t('general.select') }}
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import PackTypeViewer from '/@/components/Data/PackTypeViewer.vue'
import ExperimentalGameplay from '/@/components/Projects/CreateProject/ExperimentalGameplay.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

import { App } from '/@/App'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { addPack } from './AddPack'
import { virtualProjectName } from '../Project/Project'
import { useTranslations } from '../../Composables/useTranslations'
import { computed, ref } from 'vue'

let formatter: { format: (arr: string[]) => string }
if ('ListFormat' in Intl) {
	// @ts-ignore
	formatter = new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction',
	})
} else {
	formatter = {
		format: (arr) => arr.join(', '),
	}
}

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar

const isComMojangProject = computed(
	() => sidebar.currentState.isComMojangProject
)
const authors = computed(() => {
	const authors = sidebar.currentState.authors || 'Unknown'
	if (Array.isArray(authors))
		return formatter.format(
			authors.map((author) =>
				typeof author === 'string' ? author : author.name
			)
		)
	return authors
})

function onClose() {
	props.window.close()
}
async function onSelectProject() {
	const app = await App.getApp()

	if (isComMojangProject.value) {
		await app.projectManager.selectProject(virtualProjectName)
		app.viewComMojangProject.loadComMojangProject(
			sidebar.currentState.project
		)
	} else {
		app.projectManager.selectProject(sidebar.selected)
	}

	props.window.close()
}

const deletePending = ref(false)
function onDeleteProject(projectName: string) {
	deletePending.value = true

	new ConfirmationWindow({
		description: 'windows.deleteProject.description',
		confirmText: 'windows.deleteProject.confirm',
		cancelText: 'general.cancel',
		onConfirm: async () => {
			const app = await App.getApp()
			await app.projectManager.removeProjectWithName(projectName)

			if (app.hasNoProjects) onClose()
			else await props.window.loadProjects()

			deletePending.value = false
		},
		onCancel: () => {
			deletePending.value = false
		},
	})
}
function onAddPack() {
	addPack()
	props.window.close()
}
function onLoadAllProjects() {
	props.window.loadAllProjects()
}
async function onToggleExperiment(experiment: any) {
	const app = await App.getApp()
	const project = app.projectManager.getProject(sidebar.currentState.name)
	if (!project) return

	await project.config.toggleExperiment(project, experiment.id)
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
