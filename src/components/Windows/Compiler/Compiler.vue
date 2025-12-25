<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import Icon from '@/components/Common/Icon.vue'
import TextButton from '@/components/Common/TextButton.vue'
import Info from '@/components/Common/Info.vue'
import Warning from '@/components/Common/Warning.vue'
import Action from '@/components/Common/Action.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager, useUsingProjectOutputFolder } from '@/libs/project/ProjectManager'
import { CompilerWindow } from './CompilerWindow'
import { Windows } from '../Windows'
import { useIsMobile } from '@/libs/Mobile'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { pickDirectory } from '@/libs/fileSystem/FileSystem'

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

async function selectOutputFolder() {
	if (!ProjectManager.currentProject) return
	if (!tauriBuild) return

	const directory = await pickDirectory()

	if (!directory) return

	await ProjectManager.currentProject.setLocalOutputFolderData({ type: 'tauri', path: directory.path })
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

				<div v-if="selectedCategory === 'profiles'">
					<div class="flex flex-col gap-3">
						<Action
							v-for="action in (ProjectManager.currentProject as BedrockProject).dashService.profiles"
							:action="action"
							class="w-full"
						/>
					</div>
				</div>

				<div v-if="selectedCategory === 'outputFolder'">
					<div v-if="!tauriBuild">
						<Warning :text="t('projects.outputFolder.warning.notSupported')" class="mt-4 mb-4 mr-auto" />
					</div>

					<div v-else>
						<Info v-if="usingProjectOutputFolder" :text="t('projects.outputFolder.warning.using')" class="mt-4 mb-4" />

						<Info v-else :text="t('projects.outputFolder.warning.notUsing')" class="mt-4 mb-4" />
					</div>

					<div class="flex mb-4 mt-4">
						<TextButton :text="t('projects.outputFolder.button')" @click="selectOutputFolder" :enabled="tauriBuild" />

						<p class="text-text-secondary ml-4 self-center max-w-96">
							{{ t('projects.outputFolder.description') }}
						</p>
					</div>

					<div class="flex mb-4">
						<TextButton
							@click="ProjectManager.currentProject!.clearLocalProjectFolder()"
							:text="t('projects.clearOutputFolder.name')"
							class="block"
							:enabled="console.log(usingProjectOutputFolder) ?? usingProjectOutputFolder"
						/>

						<p class="text-text-secondary ml-4 self-center max-w-96">
							{{ t('projects.clearOutputFolder.description') }}
						</p>
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
