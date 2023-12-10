<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { projectManager, fileSystem, windows } from '@/App'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { computed, ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ProjectInfo } from '@/libs/project/Project'
import { get, set } from 'idb-keyval'

const t = useTranslate()

const projects = projectManager.useProjects()
const currentProject = projectManager.useCurrentProject()
let fileSystemSetup = ref(true)
if (fileSystem instanceof PWAFileSystem) fileSystemSetup = fileSystem.useSetup()

const suggestSelectBridgeFolder = computed(
	() => fileSystem instanceof PWAFileSystem && !fileSystemSetup.value
)

async function selectBridgeFolder() {
	if (!(fileSystem instanceof PWAFileSystem)) return

	const savedHandle: undefined | FileSystemDirectoryHandle = await get(
		'bridgeFolderHandle'
	)

	if (
		!fileSystem.baseHandle &&
		savedHandle &&
		(await fileSystem.ensurePermissions(savedHandle))
	) {
		fileSystem.setBaseHandle(savedHandle)

		return
	}

	try {
		fileSystem.setBaseHandle(
			(await window.showDirectoryPicker({
				mode: 'readwrite',
			})) ?? null
		)

		set('bridgeFolderHandle', fileSystem.baseHandle)
	} catch {}
}

async function createProject() {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup)
		await selectBridgeFolder()

	windows.open('createProject')
}

async function openProject(project: ProjectInfo) {
	projectManager.loadProject(project.name)
}
</script>

<template>
	<main
		class="w-full h-app flex justify-center items-center"
		v-if="currentProject === null"
	>
		<div class="flex flex-col max-w-[28.5rem] w-full">
			<Logo class="ml-auto mr-auto mb-24 -mt-24 w-48" />

			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text font-inter font-medium">
					{{ t('greet.projects') }}
				</p>

				<div>
					<IconButton
						icon="folder"
						class="mr-1"
						@click="selectBridgeFolder"
					/>
					<IconButton
						icon="add"
						@click="createProject"
						v-if="!suggestSelectBridgeFolder"
					/>
				</div>
			</div>

			<div class="h-px w-full bg-menu mb-1" />

			<div
				class="flex flex-wrap gap-2 overflow-x-hidden overflow-y-hidden"
			>
				<div
					class="flex flex-col bg-menu rounded-md relative w-36 h-36 cursor-pointer"
					v-for="(project, index) in projects"
					:key="index"
					@click="openProject(project)"
				>
					<div class="w-full overflow-hidden">
						<img
							:src="project.icon"
							class="w-full aspect-video object-cover"
						/>
					</div>
					<p
						class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5 font-inter font-medium"
					>
						{{ project.name }}
					</p>
				</div>
			</div>

			<div
				class="flex items-center flex-col mt-6"
				v-if="!suggestSelectBridgeFolder && projects.length === 0"
			>
				<p class="opacity-30 text-text mb-2 font-inter">
					{{ t('greet.noProjects') }}
				</p>
				<p
					class="text-primary cursor-pointer hover:underline font-inter font-medium"
					@click="createProject"
				>
					{{ t('greet.createOne') }}
				</p>
			</div>

			<div
				class="flex items-center flex-col mt-6"
				v-if="suggestSelectBridgeFolder"
			>
				<p class="opacity-30 text-text mb-2 font-inter">
					{{ t('greet.noBridgeFolderSelected') }}
				</p>
				<p
					class="text-primary cursor-pointer hover:underline font-inter font-medium"
					@click="selectBridgeFolder"
				>
					{{ t('greet.selectBridgeFolder') }}
				</p>
			</div>
		</div>
	</main>
</template>
