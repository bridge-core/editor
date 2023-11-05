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
				class="ml-auto mr-auto mb-24 -mt-24"
				alt="Logo of bridge. v2"
			/>

			<div class="flex justify-between">
				<p class="mb-1 text-lg">Projects</p>

				<div
					class="flex align-center justify-center action-bar-load-folder-prompt"
					@click="loadFolder"
					v-if="!bridgeFolderSelected && projects.length > 0"
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
						Load bridge. folder
					</p>
				</div>

				<div>
					<v-icon size="large" class="mr-1" @click="loadFolder"
						>mdi-folder</v-icon
					>
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
					<div class="project-icon w-full overflow-hidden">
						<img
							:src="project.icon"
							class="w-full aspect-video object-cover"
						/>
					</div>
					<p
						class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5"
					>
						{{ project.displayName }}
					</p>
				</div>
			</div>

			<div
				class="flex align-center flex-col mt-8"
				v-if="projects.length == 0 && bridgeFolderSelected"
			>
				<p class="opacity-30">You have no projects.</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="createProject"
				>
					Create One
				</p>
			</div>

			<div
				class="flex align-center flex-col mt-8"
				v-if="projects.length == 0 && !bridgeFolderSelected"
			>
				<p class="opacity-30">You need to select a bridge. folder.</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="loadFolder"
				>
					Select One
				</p>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/UIElements/Logo.vue'
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

let bridgeFolderSelected = ref(false)

async function loadFolder() {
	const app = await App.getApp()

	await app.setupBridgeFolder(bridgeFolderSelected.value)
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
			bridgeFolderSelected.value = true
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

	cursor: pointer;

	/* transition: background 0.2s; */
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
</style>
