<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { fileSystem, windows, selectOrLoadBridgeFolder } from '@/App'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { computed, ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ProjectInfo, ProjectManager } from '@/libs/project/ProjectManager'

const t = useTranslate()

const projects = ProjectManager.useProjects()
const currentProject = ProjectManager.useCurrentProject()
let fileSystemSetup = ref(true)
if (fileSystem instanceof PWAFileSystem) fileSystemSetup = fileSystem.useSetup()

const suggestSelectBridgeFolder = computed(
	() => fileSystem instanceof PWAFileSystem && !fileSystemSetup.value && projects.value.length == 0
)

async function createProject() {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	windows.open('createProject')
}

async function openProject(project: ProjectInfo) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	ProjectManager.loadProject(project.name)
}
</script>

<template>
	<main class="w-full h-app flex justify-center items-center" v-if="currentProject === null">
		<div class="flex flex-col max-w-[28.5rem] w-full">
			<Logo class="ml-auto mr-auto mb-24 -mt-24 w-48" />

			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text font-inter font-medium">
					{{ t('greet.projects') }}
				</p>

				<div>
					<IconButton
						v-if="fileSystem instanceof PWAFileSystem"
						icon="folder"
						class="mr-1"
						@click="selectOrLoadBridgeFolder"
					/>
					<IconButton icon="add" @click="createProject" v-if="!suggestSelectBridgeFolder" />
				</div>
			</div>

			<div class="h-px w-full bg-menu mb-1" />

			<div class="flex flex-wrap gap-2 overflow-x-hidden overflow-y-hidden mt-2">
				<div
					class="flex flex-col bg-menu rounded relative w-36 h-36 cursor-pointer border-transparent border-2 group hover:border-text transition-colors duration-100 ease-out"
					v-for="(project, index) in projects"
					:key="index"
					@click="openProject(project)"
				>
					<div class="w-full rounded overflow-hidden aspect-video">
						<img
							:src="project.icon"
							class="w-full object-cover group-hover:scale-110 transition-transform duration-100 ease-out -translate-y-1/4 pixelated"
						/>
					</div>
					<p class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5 font-inter font-medium">
						{{ project.name }}
					</p>
				</div>
			</div>

			<div class="flex items-center flex-col mt-6" v-if="!suggestSelectBridgeFolder && projects.length === 0">
				<p class="opacity-30 text-text mb-2 font-inter">
					{{ t('greet.noProjects') }}
				</p>
				<p class="text-primary cursor-pointer hover:underline font-inter font-medium" @click="createProject">
					{{ t('greet.createOne') }}
				</p>
			</div>

			<div class="flex items-center flex-col mt-6" v-if="suggestSelectBridgeFolder">
				<p class="opacity-30 text-text mb-2 font-inter">
					{{ t('greet.noBridgeFolderSelected') }}
				</p>
				<p
					class="text-primary cursor-pointer hover:underline font-inter font-medium"
					@click="selectOrLoadBridgeFolder"
				>
					{{ t('greet.selectBridgeFolder') }}
				</p>
			</div>
		</div>
	</main>
</template>

<style scoped>
.pixelated {
	image-rendering: pixelated;
}
</style>
