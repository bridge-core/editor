<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import FileExplorer from '@/components/FileExplorer/FileExplorer.vue'
import Tabs from '@/components/TabSystem/Tabs.vue'
import Icon from '@/components/Common/Icon.vue'
import { Editor } from '@/components/Editor/Editor'

import { ProjectManager } from '@/libs/project/ProjectManager'
import { useIsMobile } from '@/libs/Mobile'

const currentProject = ProjectManager.useCurrentProject()
const isMobile = useIsMobile()
</script>

<template>
	<main class="w-full h-app flex gap-2" v-if="currentProject !== null && !isMobile">
		<Sidebar />
		<FileExplorer />
		<Tabs />
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

		<div
			class="absolute left-2 bottom-2 rounded flex p-1 transition-colors duration-200 ease-out outline-none border-none"
			:class="{
				'bg-background-secondary': Editor.sideCollapsed.value,
				'bg-background': !Editor.sideCollapsed.value,
			}"
			v-if="currentProject !== null && isMobile"
			@click="Editor.toggleTabs"
		>
			<Icon
				icon="chevron_right"
				class="transition-tansform duration-200 ease-out"
				:class="{ 'rotate-180': Editor.sideCollapsed.value }"
			/>
		</div>
	</main>
</template>
