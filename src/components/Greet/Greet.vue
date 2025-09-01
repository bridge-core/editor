<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'
import Icon from '@/components/Common/Icon.vue'
import ProjectGalleryEntry from './ProjectGalleryEntry.vue'
import TextButton from '@/components/Common/TextButton.vue'
import Notification from '@/components/Notifications/Notification.vue'

import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { computed, ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ProjectInfo, ProjectManager, useConvertableProjects, useCurrentProject, useProjects } from '@/libs/project/ProjectManager'
import { Windows } from '@/components/Windows/Windows'
import { fileSystem, loadBridgeFolder, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { CreateProjectWindow } from '@/components/Windows/CreateProject/CreateProjectWindow'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { convertProject } from '@/libs/project/ConvertComMojangProject'

const t = useTranslate()

const projects = useProjects()
const convertableProjects = useConvertableProjects()
const currentProject = useCurrentProject()
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

async function edit(name: string) {}
</script>

<template>
	<main class="w-full h-app flex justify-center items-center" v-if="currentProject === null">
		<div class="flex flex-col max-w-[28.5rem] w-full mx-8 max-h-app">
			<Logo class="ml-auto mr-auto my-12 w-48 flex-shrink min-h-0" />

			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text font-theme font-medium">
					{{ t('greet.projects') }}
				</p>

				<div @click="loadBridgeFolder" class="group flex gap-1 mt-1">
					<Icon icon="help" class="text-base text-primary group-hover:text-text transition-colors duration-100 ease-in-out" />

					<a
						class="text-base text-primary font-theme group-hover:text-text group-hover:underline cursor-pointer transition-colors duration-100 ease-in-out"
						>{{ t('Click to Load bridge. Folder') }}</a
					>
				</div>

				<div>
					<IconButton v-if="fileSystem instanceof PWAFileSystem" icon="folder" class="mr-1" @click="selectOrLoadBridgeFolder" />
					<IconButton icon="add" @click="createProject" v-if="!suggestSelectBridgeFolder" />
				</div>
			</div>

			<div class="h-px w-full bg-background-secondary mb-1" />

			<div class="flex flex-wrap gap-2 overflow-x-hidden overflow-y-auto mt-2 max-h-[28rem] project-gallery">
				<ProjectGalleryEntry
					v-for="(project, index) in projects.toSorted((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))"
					:key="index"
					:icon="project.icon"
					:name="project.name"
					:favorite="project.favorite"
					@click="openProject(project)"
					@favorite="ProjectManager.toggleFavoriteProject"
					@edit="edit"
				/>

				<ProjectGalleryEntry
					v-for="(project, index) in convertableProjects"
					:key="index"
					:icon="project.icon"
					:name="project.name"
					:favorite="false"
					:read-only="true"
					@click="convertProject(project)"
				/>
			</div>

			<div class="flex items-center flex-col mt-6" v-if="!suggestSelectBridgeFolder && projects.length === 0">
				<p class="opacity-30 text-text mb-4 font-theme">
					{{ t('greet.noProjects') }}
				</p>

				<TextButton :text="t('greet.createOne')" @click="createProject" />
			</div>

			<div class="flex items-center flex-col mt-6" v-if="suggestSelectBridgeFolder">
				<p class="opacity-30 text-text mb-4 font-theme">
					{{ t('greet.noBridgeFolderSelected') }}
				</p>

				<TextButton :text="t('greet.selectBridgeFolder')" @click="selectOrLoadBridgeFolder" />
			</div>

			<div class="flex flex-row mt-5 overflow-x-auto gap-2 mb-12 min-h-max">
				<Notification
					v-for="item in NotificationSystem.notifications.value"
					:key="item.id"
					@click="() => NotificationSystem.activateNotification(item)"
					:icon="item.icon"
					:type="item.type"
					:progress="item.progress"
					:max-progress="item.progress"
					:color="item.color"
					:color-hover="item.color ? 'accent' : undefined"
					icon-color="accent"
					:icon-color-hover="item.color ? 'accentSecondary' : undefined"
				/>
			</div>
		</div>
	</main>
</template>

<style scoped>
.pixelated {
	image-rendering: pixelated;
}

.project-gallery {
	width: calc(100% + 0.5rem);
}
</style>
