<template>
	<main>
		<div class="p-2 top-bar">
			<div class="icon-buttons">
				<v-icon size="large" @click="openSettingsWindow"
					>mdi-cog</v-icon
				>
				<v-icon size="large" @click="openHelp">mdi-help-circle</v-icon>
				<v-icon
					v-if="nativeBuildAvailable"
					size="large"
					@click="openDownloadPage"
					>mdi-download</v-icon
				>
			</div>
			<div
				class="px-1 rounded d-table app-version-display"
				@click="openChangelogWindow"
			>
				v{{ appVersion }}
			</div>
		</div>

		<div class="d-flex flex-column projects-container">
			<Logo
				style="height: 160px; width: 160px"
				class="ml-auto mr-auto mb-12"
				alt="Logo of bridge. v2"
			/>

			<div class="flex justify-between">
				<p class="mb-1 text-lg">Projects</p>
				<div>
					<div class="inline relative">
						<v-icon size="large" class="mr-1" @click="loadFolder"
							>mdi-folder</v-icon
						>
						<div class="notification">
							<div class="notification-inner" />
						</div>
					</div>
					<v-icon size="large" @click="createProject"
						>mdi-plus</v-icon
					>
				</div>
			</div>
			<div class="seperator" />
			<div class="project-list">
				<div
					class="project"
					v-for="(project, index) in projects"
					:key="index"
					@click="selectProject(project)"
				>
					<img
						:src="project.icon"
						class="w-full aspect-video object-cover"
					/>
					<p
						class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5"
					>
						{{ project.displayName }}
					</p>
				</div>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/UIElements/Logo.vue'
import CommandBar from '../CommandBar/CommandBar.vue'
import { version as appVersion } from '/@/utils/app/version'
import { App } from '/@/App'
import { computed, onMounted, onUnmounted, Ref, ref } from 'vue'

const nativeBuildAvailable = computed(() => {
	return !import.meta.env.VITE_IS_TAURI_APP && !App.instance.mobile.is.value
})

async function openChangelogWindow() {
	const app = await App.getApp()

	app.windows.changelogWindow.open()
}

async function openSettingsWindow() {
	const app = await App.getApp()

	app.windows.settings.open()
}

function openHelp() {
	App.openUrl('https://bridge-core.app/guide/', undefined, true)
}

function openDownloadPage() {
	App.openUrl('https://bridge-core.app/guide/download/', undefined, true)
}

async function createProject() {
	const app = await App.getApp()

	app.windows.createProject.open()
}

let bridgeFolderSelected = false

async function loadFolder() {
	const app = await App.getApp()

	await app.setupBridgeFolder(bridgeFolderSelected)
}

let disposables: any[] = []

let projects: Ref<any> = ref([])

async function loadProjects() {
	const app = await App.getApp()

	projects.value = await app.fileSystem
		.readJSON('~local/data/projects.json')
		.catch(() => [])
}

async function selectProject(project: any) {
	const app = await App.getApp()

	if (project.requiresPermissions) {
		const wasSuccessful = await app.setupBridgeFolder()

		if (!wasSuccessful) return
	}

	await app.projectManager.selectProject(project.name, true)
}

onMounted(async () => {
	loadProjects()

	disposables.push(
		App.eventSystem.on('availableProjectsFileChanged', () => loadProjects())
	)

	const app = await App.getApp()

	disposables.push(
		app.bridgeFolderSetup.once(() => {
			bridgeFolderSelected = true
		}, true)
	)
})

onUnmounted(() => {
	disposables.forEach((disposable) => disposable.dispose())
	disposables = []
})
</script>

<style scoped>
main {
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: center;
	align-items: center;
}

.projects-container {
	width: 28rem;
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
}

.project {
	display: flex;
	flex-direction: column;

	width: 9rem;
	height: 9rem;

	background: var(--v-menu-base);

	border-radius: 4px;

	filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.4));
}

.project > p {
	margin: 0;
}

.top-bar {
	position: absolute;
	top: 0;
	width: 100%;

	display: flex;
}

.app-version-display {
	app-region: no-drag;
	-webkit-app-region: no-drag;
	cursor: pointer;
	font-size: 12px;

	margin-left: auto;
}

.icon-buttons {
	display: flex;
	gap: 0.5rem;
}

.notification {
	position: absolute;

	top: 2px;
	right: 2px;

	width: 8px;
	height: 8px;

	background-color: var(--v-error-base);

	border-radius: 50%;
}

.notification-inner {
	position: absolute;

	top: 2px;
	right: 2px;

	width: 4px;
	height: 4px;

	background-color: white;

	border-radius: 50%;
}
</style>
