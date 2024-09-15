<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import Icon from '@/components/Common/Icon.vue'
import TextButton from '@/components/Common/Button.vue'
import Info from '@/components/Common/Info.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import { BedrockProject } from '@/libs/project/BedrockProject'
import FileSystemDrop from '@/components/Common/FileSystemDrop.vue'
import { ProjectManager, useUsingProjectOutputFolder } from '@/libs/project/ProjectManager'
import { CompilerWindow } from './CompilerWindow'
import { Windows } from '../Windows'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()

const usingProjectOutputFolder = useUsingProjectOutputFolder()

const categories: {
	name: string
	id: string
	icon: string
}[] = [
	{
		name: 'General',
		id: 'general',
		icon: 'settings',
	},
	{
		name: 'Profiles',
		id: 'profiles',
		icon: 'group',
	},
	{
		name: 'Output Folder',
		id: 'outputFolder',
		icon: 'folder',
	},
	{
		name: 'Logs',
		id: 'logs',
		icon: 'contract',
	},
]

const selectedCategory = ref(categories[0].id)

async function droppedOutputFolder(items: DataTransferItemList) {
	if (!ProjectManager.currentProject) return

	const fileHandle = await items[0].getAsFileSystemHandle()

	if (!fileHandle) return
	if (!(fileHandle instanceof FileSystemDirectoryHandle)) return

	await ProjectManager.currentProject.setLocalProjectFolderHandle(fileHandle)
}

const isMobile = useIsMobile()
</script>

<template>
	<SidebarWindow :name="t('sidebar.compiler.name')" @close="Windows.close(CompilerWindow)">
		<template #sidebar="{ hide }">
			<div class="p-4">
				<div class="overflow-y-scroll max-h-[34rem]">
					<button
						v-for="category of categories"
						class="w-full flex align-center gap-2 border-transparent hover:border-text border-2 transition-colors duration-100 ease-out rounded p-1 mt-1"
						:class="{
							'bg-primary': selectedCategory === category.id,
						}"
						@click="
							() => {
								selectedCategory = category.id
								hide()
							}
						"
					>
						<Icon
							:icon="category.icon"
							class="text-base transition-colors duration-100 ease-out"
							:class="{
								'text-text': selectedCategory === category.id,
								'text-primary': selectedCategory !== category.id,
							}"
						/>
						<span class="font-theme select-none">{{ t(category.name) }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div
				class="max-w-[64rem] w-[50vw] h-[38rem] flex flex-col overflow-y-auto p-3 pt-0"
				:class="{ 'w-full': isMobile, 'h-full': isMobile }"
			>
				<div v-if="selectedCategory === 'general'">
					<TextButton
						text="Compile"
						@click="() =>
							(ProjectManager.currentProject as BedrockProject).dashService.build()
						"
					/>
				</div>

				<div v-if="selectedCategory === 'outputFolder'">
					<Info
						v-if="usingProjectOutputFolder"
						text="This project is using a local project folder."
						class="mt-4 mb-4 ml-auto mr-auto"
					/>

					<Info
						v-else
						text="This project not is using a local project folder."
						class="mt-4 mb-4 ml-auto mr-auto"
					/>

					<FileSystemDrop
						class="mt-8 mb-8 w-full h-48"
						text="Drop your project output folder here."
						@drop="droppedOutputFolder"
					/>

					<div class="flex gap-6 items-center">
						<TextButton
							text="Clear Output Folder"
							@click="ProjectManager.currentProject!.clearLocalProjectFolder()"
						/>
						<p class="text-text-secondary">{{ t('Forget the current project output folder.') }}</p>
					</div>
				</div>

				<div v-if="selectedCategory === 'logs'">
					<div>
						<p
							v-for="log in (<BedrockProject>ProjectManager.currentProject).dashService.logs"
							class="font-theme border-b border-background-secondary pb-2 mb-2 text-sm"
						>
							{{ log }}
						</p>
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
