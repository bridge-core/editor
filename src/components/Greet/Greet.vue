<template>
	<main class="w-full h-full flex justify-center items-center">
		<div class="flex flex-col max-w-[28rem] w-full">
			<Logo class="ml-auto mr-auto mb-24 -mt-24 w-48" />

			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text">Projects</p>

				<div>
					<IconButton
						icon="folder"
						class="mr-1"
						@click="selectBridgeFolder"
					/>
					<IconButton icon="add" @click="createProject" />
				</div>
			</div>

			<div class="h-px w-full bg-menu mb-1" />

			<div
				class="flex flex-wrap gap-2 max-h-[28.5rem] overflow-x-hidden overflow-y-hidden max-w-[]"
			>
				<div
					class="flex flex-col bg-menu rounded-md relative w-36 h-36"
					v-for="(project, index) in projects"
					:key="index"
				>
					<div class="w-full overflow-hidden">
						<img
							:src="project.icon"
							class="w-full aspect-video object-cover"
						/>
					</div>
					<p
						class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5"
					>
						{{ project.name }}
					</p>
				</div>
			</div>

			<div
				class="flex items-center flex-col mt-6"
				v-if="!suggestSelectBridgeFolder && projects.length === 0"
			>
				<p class="opacity-30 text-text mb-2">
					You have no projects yet.
				</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="createProject"
				>
					{{ 'Create one' }}
				</p>
			</div>

			<div
				class="flex items-center flex-col mt-6"
				v-if="suggestSelectBridgeFolder"
			>
				<p class="opacity-30 text-text mb-2">
					You need to select a bridge. folder.
				</p>
				<p
					class="text-primary cursor-pointer hover:underline"
					@click="selectBridgeFolder"
				>
					{{ 'Select a bridge. folder' }}
				</p>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/Common/Logo.vue'
import IconButton from '/@/components/Common/IconButton.vue'

import { App } from '/@/App'
import { PWAFileSystem } from '/@/libs/fileSystem/PWAFileSystem'
import { computed } from 'vue'

const projects = App.instance.useProjects()
const brigeFolderSelected = App.instance.useBridgeFolderSelected()

const suggestSelectBridgeFolder = computed(
	() =>
		App.instance.fileSystem instanceof PWAFileSystem &&
		!brigeFolderSelected.value
)

async function selectBridgeFolder() {
	const fileSystem = App.instance.fileSystem

	if (!(fileSystem instanceof PWAFileSystem)) return

	fileSystem.setBaseHandle(
		(await window.showDirectoryPicker({
			mode: 'readwrite',
		})) ?? null
	)
}

async function createProject() {
	const fileSystem = App.instance.fileSystem

	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup)
		await selectBridgeFolder()

	App.instance.windows.open('Create Project')
}
</script>
