<template>
	<main>
		<div class="p-2 top-bar">
			<div class="icon-buttons">
				<v-icon size="large" color="accent">mdi-cog</v-icon>
				<v-icon size="large" color="accent">mdi-help-circle</v-icon>
				<v-icon size="large" color="accent">mdi-download</v-icon>
			</div>
			<div
				class="px-1 rounded-lg d-table app-version-display"
				@click="openChangelogWindow"
			>
				v{{ appVersion }}
			</div>
		</div>

		<div class="d-flex flex-column w-72">
			<Logo
				style="height: 160px; width: 160px"
				class="ml-auto mr-auto mb-12"
				alt="Logo of bridge. v2"
			/>
			<p class="mb-1 text-lg">Projects</p>
			<div class="seperator" />
			<div class="project-list">
				<div class="project">
					<Logo class="mr-2" style="height: 40px; width: 40px" />
					<p>My New Bridge Project</p>
				</div>
				<div class="project">
					<Logo class="mr-2" style="height: 40px; width: 40px" />
					<p>Scripting Testing Project</p>
				</div>
				<div class="project">
					<Logo class="mr-2" style="height: 40px; width: 40px" />
					<p>Experiments</p>
				</div>
			</div>

			<div class="main-buttons">
				<div class="main-button">
					<v-icon size="large">mdi-folder</v-icon>
					<p>Load Projects</p>
				</div>
				<div class="main-button">
					<v-icon class="smaller-icon" size="large">mdi-plus</v-icon>
					<p>New</p>
				</div>
			</div>
		</div>
	</main>
</template>

<script setup>
import Logo from '/@/components/UIElements/Logo.vue'
import { version as appVersion } from '/@/utils/app/version.ts'
import { App } from '/@/App.ts'

async function openChangelogWindow() {
	const app = await App.getApp()
	await app.windows.changelogWindow.open()
}
</script>

<style scoped>
main {
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: center;
	align-items: center;
}

.seperator {
	height: 1px;
	width: 100%;
	background-color: var(--v-menu-base);

	margin-bottom: 1rem;
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

.main-buttons {
	display: flex;

	justify-content: space-evenly;
}

.main-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;

	background: var(--v-menu-base);

	padding: 0.25rem;
	padding-left: 0.5rem;
	padding-right: 0.5rem;

	border-radius: 4px;

	margin-top: 2rem;
}

.main-button > p {
	margin: 0;
}

.smaller-icon {
	margin-left: -0.2rem;
	margin-right: -0.25rem;
}
</style>
