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
				class="px-1 rounded-lg d-table app-version-display"
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
				>
					<Logo class="mr-3" style="height: 40px; width: 40px" />
					<p class="text-sm">{{ project }}</p>
				</div>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/UIElements/Logo.vue'
import { version as appVersion } from '/@/utils/app/version'
import { App } from '/@/App'
import { computed, onMounted, onUnmounted } from 'vue'

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

const projects = [
	'My New Bridge Project',
	'My New Bridge Project',
	'My New Bridge Project',
	'My New Bridge Project',
	'My New Bridge Project',
	'My New Bridge Project',
]

let disposables: any[] = []

onMounted(async () => {
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

	justify-content: space-between;
}

.project {
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
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
