<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'
import ProjectGalleryEntry from './ProjectGalleryEntry.vue'
import TextButton from '@/components/Common/TextButton.vue'

import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { computed, ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ProjectInfo, ProjectManager } from '@/libs/project/ProjectManager'
import { Windows } from '@/components/Windows/Windows'
import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { CreateProjectWindow } from '@/components/Windows/CreateProject/CreateProjectWindow'

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

	Windows.open(CreateProjectWindow)
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

			<div class="h-px w-full bg-background-secondary mb-1" />

			<div class="flex flex-wrap gap-2 overflow-x-hidden overflow-y-hidden mt-2">
				<ProjectGalleryEntry
					v-for="(project, index) in projects"
					:key="index"
					:icon="project.icon"
					:name="project.name"
					@click="openProject(project)"
				/>
			</div>

			<div class="flex items-center flex-col mt-6" v-if="!suggestSelectBridgeFolder && projects.length === 0">
				<p class="opacity-30 text-text mb-4 font-inter">
					{{ t('greet.noProjects') }}
				</p>

				<TextButton :text="t('greet.createOne')" @click="createProject" />
			</div>

			<div class="flex items-center flex-col mt-6" v-if="suggestSelectBridgeFolder">
				<p class="opacity-30 text-text mb-4 font-inter">
					{{ t('greet.noBridgeFolderSelected') }}
				</p>

				<TextButton :text="t('greet.selectBridgeFolder')" @click="selectOrLoadBridgeFolder" />
			</div>
		</div>
	</main>
</template>

<style scoped>
.pixelated {
	image-rendering: pixelated;
}
</style>
