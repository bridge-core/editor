<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import Icon from '@/components/Common/Icon.vue'
import TextButton from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import { projectManager } from '@/App'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'

const t = useTranslate()

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

const outputFolderInputHovered = ref(false)

async function droppedOutputFolder(event: DragEvent) {
	event.preventDefault()
	event.stopPropagation()

	outputFolderInputHovered.value = false

	if (!event.dataTransfer) return

	if (!projectManager.currentProject) return

	const items = event.dataTransfer.items

	const fileHandle = await items[0].getAsFileSystemHandle()

	if (!fileHandle) return
	if (!(fileHandle instanceof FileSystemDirectoryHandle)) return

	await projectManager.currentProject.setLocalProjectFolder(fileHandle)
}
</script>

<template>
	<SidebarWindow :name="t('sidebar.compiler.name')" id="compiler" ref="window">
		<template #sidebar>
			<div class="p-4">
				<div class="overflow-y-scroll max-h-[34rem]">
					<button
						v-for="category of categories"
						class="w-full flex align-center gap-2 border-transparent hover:border-text border-2 transition-colors duration-100 ease-out rounded p-2 mt-1"
						:class="{
							'bg-primary': selectedCategory === category.id,
						}"
						@click="selectedCategory = category.id"
					>
						<Icon
							:icon="category.icon"
							class="text-base transition-colors duration-100 ease-out"
							:class="{
								'text-text': selectedCategory === category.id,
								'text-primary': selectedCategory !== category.id,
							}"
						/>
						<span class="font-inter select-none">{{ t(category.name) }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-3 pt-0">
				<div v-if="selectedCategory === 'general'">
					<TextButton
						text="Compile"
						@click="() =>
							(projectManager.currentProject as BedrockProject).dashService.build()
						"
					/>
				</div>

				<div v-if="selectedCategory === 'outputFolder'">
					<p
						v-if="projectManager.currentProject?.outputFileSystem instanceof LocalFileSystem"
						class="font-inter mt-2 text-center"
					>
						{{ t('You need to select an output folder.') }}
					</p>
					<div
						class="mt-8 mb-8 w-full h-48 border-2 border-dashed rounded flex justify-center items-center transition-colors duration-100 ease-out"
						:class="{
							'border-primary': outputFolderInputHovered,
							'border-menuAlternate': !outputFolderInputHovered,
						}"
						@dragenter="outputFolderInputHovered = true"
						@dragleave="outputFolderInputHovered = false"
						@dragover.prevent
						@drop="droppedOutputFolder"
					>
						<span class="font-inter text-textAlternate select-none pointer-events-none">
							{{ t('Drop your project output folder here.') }}
						</span>
					</div>

					<div class="flex gap-6 items-center">
						<TextButton
							text="Clear Output Folder"
							@click="projectManager.currentProject!.clearLocalProjectFolder()"
						/>
						<p class="text-textAlternate">{{ t('Forget the current project output folder.') }}</p>
					</div>
				</div>

				<div v-if="selectedCategory === 'logs'">
					<div>
						<p
							v-for="log in (<BedrockProject>projectManager.currentProject).dashService.logs"
							class="font-inter border-b border-menuAlternate pb-2 mb-2 text-sm"
						>
							{{ log }}
						</p>
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
