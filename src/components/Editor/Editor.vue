<template>
	<main class="w-full h-app flex gap-2" v-if="currentProject !== null">
		<Sidebar :instance="App.instance.sidebar" />
		<FileExplorer :instance="App.instance.fileExplorer" />
	</main>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar/Sidebar.vue'
import FileExplorer from './FileExplorer/FileExplorer.vue'
import { App } from '/@/App'

const currentProject = App.instance.projectManager.useCurrentProject()
</script>
