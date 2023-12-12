<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import Icon from '@/components/Common/Icon.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import { projectManager } from '@/App'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'

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

	await projectManager.currentProject.setOutputFolder(fileHandle)
}
</script>

<template>
	<SidebarWindow :name="t('Compiler')" id="compiler" ref="window">
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
								'text-primary':
									selectedCategory !== category.id,
							}"
						/>
						<span class="font-inter select-none">{{
							t(category.name)
						}}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div
				class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0"
			>
				<div v-if="selectedCategory === 'outputFolder'">
					<p
						v-if="
							projectManager.currentProject
								?.outputFileSystem instanceof LocalFileSystem
						"
						class="font-inter mt-2 text-center"
					>
						{{ t('You need to select an output folder.') }}
					</p>
					<div
						class="mt-8 ml-auto mr-auto w-96 h-48 border-2 border-dashed rounded flex justify-center items-center transition-colors duration-100 ease-out"
						:class="{
							'border-primary': outputFolderInputHovered,
							'border-menuAlternate': !outputFolderInputHovered,
						}"
						@dragenter="outputFolderInputHovered = true"
						@dragleave="outputFolderInputHovered = false"
						@dragover.prevent
						@drop="droppedOutputFolder"
					>
						<span
							class="font-inter text-textAlternate select-none pointer-events-none"
						>
							{{ t('Drop your output folder here.') }}
						</span>
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
