<template>
	<main class="w-full h-app flex gap-2" v-if="currentProject !== null">
		<Sidebar />
		<FileExplorer />
		<Tabs />
	</main>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import FileExplorer from '@/components/FileExplorer/FileExplorer.vue'
import Tabs from '@/components/TabSystem/Tabs.vue'
import { ProjectManager } from '@/libs/project/ProjectManager'

const currentProject = ProjectManager.useCurrentProject()
</script>
