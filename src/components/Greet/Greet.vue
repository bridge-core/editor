<template>
	<main>
		<div class="d-flex flex-column projects-container">
			<Logo
				style="height: 160px; width: 160px"
				class="ml-auto mr-auto mb-20 -mt-36"
				alt="Logo of bridge. v2"
			/>

			<div class="flex justify-between">
				<p class="mb-1 text-lg">Projects</p>

				<div
					class="flex align-center justify-center action-bar-load-folder-prompt"
					@click="loadFolder"
					v-if="suggestSelectingBridgeFolder && projects.length > 0"
				>
					<v-icon
						size="large"
						class="mr-1.5 relative bottom-0.25"
						color="primary"
						>mdi-alert-circle</v-icon
					>
					<p
						class="text-primary cursor-pointer hover:underline mb-0 inline h-6"
					>
						{{
							t(
								'windows.settings.general.selectBridgeFolder.name'
							)
						}}
					</p>
				</div>

				<div>
					<v-tooltip
						color="tooltip"
						bottom
						v-if="!isUsingFileSystemPolyfill && !tauri"
					>
						<template v-slot:activator="{ on }">
							<v-icon
								size="large"
								class="mr-1 hover:text-accent transition-colors duration-100 ease-out"
								@click="loadFolder"
								v-on="on"
								>mdi-folder</v-icon
							>
						</template>

						<span>{{
							t(
								'windows.settings.general.selectBridgeFolder.name'
							)
						}}</span>
					</v-tooltip>

					<v-tooltip color="tooltip" bottom>
						<template v-slot:activator="{ on }">
							<v-icon
								size="large"
								class="mr-1 hover:text-accent transition-colors duration-100 ease-out"
								@click="createProject"
								v-on="on"
								>mdi-plus</v-icon
							>
						</template>

						<span>{{
							t('windows.projectChooser.newProject.name')
						}}</span>
					</v-tooltip>

					<v-tooltip color="tooltip" bottom>
						<template v-slot:activator="{ on }">
							<v-icon
								size="large"
								class="hover:text-accent transition-colors duration-100 ease-out"
								@click="openMore"
								v-on="on"
								>mdi-dots-horizontal</v-icon
							>
						</template>

						<span>{{ t('general.more') }}</span>
					</v-tooltip>
				</div>
			</div>

			<div class="seperator" />

			<div class="project-list">
				<div
					class="project relative"
					v-for="(project, index) in projects"
					:key="index"
					@click="selectProject(project)"
				>
					<div class="project-icon w-full overflow-hidden">
						<img
							:src="project.icon ?? project.packs[0].packIcon"
							class="w-full aspect-video object-cover"
						/>
					</div>
					<p
						class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5"
					>
						{{ project.displayName ?? project.name }}
					</p>

					<v-tooltip color="tooltip" left>
						<template v-slot:activator="{ on }">
							<v-icon
								size="large"
								class="opacity-20 hover:opacity-100 transition-opacity duration-100 ease-out !absolute top-1 right-1"
								@click.stop="() => pin(project)"
								v-on="on"
								>{{
									project.isFavorite
										? 'mdi-pin'
										: 'mdi-pin-outline'
								}}</v-icon
							>
						</template>

						<span>{{
							project.isFavorite
								? t('greet.unpin')
								: t('greet.pin')
						}}</span>
					</v-tooltip>
				</div>

				<div
					class="new-project-button group"
					@click="createProject"
					v-if="projects.length > 0"
				>
					<div
						class="flex align-center justify-center group-hover:scale-105 transition-transform duration-100 ease-out"
					>
						<v-icon size="large" class="mr-2">mdi-plus</v-icon>
						<span>
							{{ t('windows.projectChooser.newProject.name') }}
						</span>
					</div>
				</div>
			</div>

			<div
				class="flex align-center flex-col mt-8"
				v-if="projects.length == 0 && !suggestSelectingBridgeFolder"
			>
				<p class="opacity-30">You have no projects.</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="createProject"
				>
					{{ t('windows.projectChooser.newProject.name') }}
				</p>
			</div>

			<div
				class="flex align-center flex-col mt-8"
				v-if="projects.length == 0 && suggestSelectingBridgeFolder"
			>
				<p class="opacity-30">You need to select a bridge. folder.</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="loadFolder"
				>
					{{ t('windows.settings.general.selectBridgeFolder.name') }}
				</p>
			</div>

			<div class="flex">
				<SidebarButton
					v-for="notification in NotificationStore"
					v-if="notification.isVisible"
					:key="notification.id"
					:displayName="notification.message"
					:icon="notification.icon"
					:color="notification.color"
					:iconColor="notification.textColor"
					@click="notification.onClick()"
					@middleClick="notification.onMiddleClick()"
				/>

				<SidebarButton
					v-for="(task, i) in tasks"
					:key="`${i}`"
					:displayName="task.name"
					:icon="task.icon"
					color="primary"
					isLoading
					alwaysAllowClick
					@click="task.createWindow()"
				>
					<v-progress-circular
						rotate="-90"
						size="24"
						width="2"
						color="white"
						:indeterminate="task.progress === undefined"
						:value="task.progress"
					/>
				</SidebarButton>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/UIElements/Logo.vue'
import SidebarButton from '/@/components/Sidebar/Button.vue'

import { App } from '/@/App'
import { computed, onMounted, onUnmounted, Ref, ref } from 'vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { NotificationStore } from '/@/components/Notifications/state'
import { tasks } from '/@/components/TaskManager/TaskManager'
import { ComMojangProjectLoader } from '/@/components/OutputFolders/ComMojang/ProjectLoader'
import { virtualProjectName } from '../Projects/Project/Project'

const tauri = import.meta.env.VITE_IS_TAURI_APP

const { t } = useTranslations()

const suggestSelectingBridgeFolder = computed(() => {
	return (
		!isUsingFileSystemPolyfill.value &&
		!bridgeFolderSelected.value &&
		!tauri
	)
})

async function createProject() {
	const app = await App.getApp()

	if (!isUsingFileSystemPolyfill.value && !tauri) await loadFolder()

	app.windows.createProject.open()
}

let bridgeFolderSelected = ref(false)

async function loadFolder() {
	const app = await App.getApp()

	await app.setupBridgeFolder(bridgeFolderSelected.value)
	await app.comMojang.setupComMojang()
}

let disposables: any[] = []

let projects: Ref<any> = ref([])

let comMojangProjectLoader: null | ComMojangProjectLoader = null

async function loadProjects() {
	const app = await App.getApp()

	projects.value = await app.fileSystem
		.readJSON('~local/data/projects.json')
		.catch(() => [])

	if (comMojangProjectLoader !== null) {
		projects.value = projects.value.concat(
			(await comMojangProjectLoader.loadProjects()).map((project) => ({
				...project,
				comMojang: true,
			}))
		)
	}

	await sortProjects()
}

function sortProjects() {
	projects.value = projects.value.sort((a: any, b: any) => {
		if (a.isFavorite && !b.isFavorite) return -1

		if (!a.isFavorite && b.isFavorite) return 1

		const revalence = (b.lastOpened ?? 0) - (a.lastOpened ?? 0)
		if (revalence !== 0) return revalence

		return (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name)
	})
}

async function selectProject(project: any) {
	const app = await App.getApp()

	if (project.requiresPermissions) {
		const wasSuccessful = await app.setupBridgeFolder()

		if (!wasSuccessful) return
	}

	if (project.comMojang) {
		await app.projectManager.selectProject(virtualProjectName)
		app.viewComMojangProject.loadComMojangProject(project)

		return
	}

	await app.projectManager.selectProject(project.name)
}

async function saveProjects() {
	const app = await App.getApp()
	await app.fileSystem.writeJSON(
		'~local/data/projects.json',
		projects.value.map((project: any) => ({
			...project,
			isLoading: undefined,
		}))
	)
}

async function pin(project: any) {
	project.isFavorite = !project.isFavorite
	sortProjects()
	await saveProjects()
}

const hasVisibleNotifications = computed(() => {
	return Object.values(NotificationStore).some(({ isVisible }) => isVisible)
})

onMounted(async () => {
	loadProjects()

	disposables.push(
		App.eventSystem.on('availableProjectsFileChanged', () => loadProjects())
	)

	const app = await App.getApp()

	disposables.push(
		app.bridgeFolderSetup.once(() => {
			bridgeFolderSelected.value = true
		}, true)
	)

	comMojangProjectLoader = new ComMojangProjectLoader(app)
})

onUnmounted(() => {
	disposables.forEach((disposable) => disposable.dispose())
	disposables = []
})

async function openMore() {
	const app = await App.getApp()

	await app.setupBridgeFolder(false)
	await app.comMojang.setupComMojang()
	await app.windows.projectChooser.loadAllProjects()
	app.windows.projectChooser.open()
}
</script>

<style scoped>
main {
	width: 100%;
	min-height: calc(100% - env(titlebar-area-height, 24px));

	position: relative;

	top: env(titlebar-area-height, 24px);

	display: flex;
	justify-content: center;
	align-items: center;
}

.projects-container {
	width: 80%;
	max-width: 28rem;

	margin-top: 8rem;
}

.seperator {
	height: 1px;
	width: 100%;
	background-color: var(--v-menu-base);

	margin-bottom: 1rem;
}

.project-list {
	display: flex;
	flex-wrap: wrap;

	gap: 0.5rem;

	max-height: 28.5rem;
	overflow: hidden;
	overflow-y: auto;

	width: calc(100% + 1rem);
}

.new-project-button {
	display: flex;
	align-items: center;
	justify-content: center;

	width: 9rem;
	height: 9rem;

	background: var(--v-sidebarNavigation-base);

	border-radius: 4px;

	cursor: pointer;
}

.project {
	display: flex;
	flex-direction: column;

	width: 9rem;
	height: 9rem;

	background: var(--v-sidebarNavigation-base);

	border-radius: 4px;

	cursor: pointer;
}

.project > .project-icon > img {
	transition: scale 0.2s;
}

.project:hover > .project-icon > img {
	scale: 1.5;
}

.project > p {
	margin: 0;
}

.v-icon::after {
	opacity: 0 !important;
}
</style>
