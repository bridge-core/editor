<template>
	<main class="w-full h-app flex gap-2" v-if="currentProject !== null">
		<Sidebar :instance="App.instance.sidebar" />
		<FileBrowser :instance="App.instance.fileBrowser" />
	</main>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar/Sidebar.vue'
import FileBrowser from './FileBrowser/FileBrowser.vue'
import { App } from '/@/App'

const currentProject = App.instance.projectManager.useCurrentProject()
</script>
