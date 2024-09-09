<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import FileExplorer from '@/components/FileExplorer/FileExplorer.vue'
import Tabs from '@/components/TabSystem/Tabs.vue'

import { ProjectManager } from '@/libs/project/ProjectManager'
import { useIsMobile } from '@/libs/Mobile'
import { Editor } from '@/components/Editor/Editor'
import { Settings } from '@/libs/settings/Settings'

const currentProject = ProjectManager.useCurrentProject()
const isMobile = useIsMobile()
</script>

<template>
	<main class="w-full h-app flex gap-2" v-if="currentProject !== null && !isMobile">
		<!-- YES I KNOW THIS IS STUPID, STILL WORKING ON THIS! -->
		<template v-if="Settings.get('sidebarRight')">
			<FileExplorer />
			<Sidebar />
			<Tabs />
		</template>
		<template v-else>
			<Sidebar />
			<FileExplorer />
			<Tabs />
		</template>
	</main>

	<main class="w-full h-app relative" v-if="currentProject !== null && isMobile">
		<div
			class="w-full h-full flex gap-2 pr-2 absolute right-0 transition-[right] duration-200 ease-out"
			:class="{ 'right-full': Editor.sideCollapsed.value }"
		>
			<Sidebar />

			<FileExplorer />
		</div>

		<div
			class="w-full h-full flex pl-2 absolute left-0 transition-[left] duration-200 ease-out"
			:class="{ 'left-full': !Editor.sideCollapsed.value }"
		>
			<Tabs />
		</div>
	</main>
</template>
