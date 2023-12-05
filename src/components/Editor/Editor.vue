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

import { projectManager } from '@/App'

const currentProject = projectManager.useCurrentProject()
</script>
../FileExplorer/FileExplorer.vue../Sidebar/Sidebar.vue
