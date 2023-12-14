<script setup lang="ts">
import File from './File.vue'
import Directory from './Directory.vue'
import Icon from '@/components/Common/Icon.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'

import {
	projectManager,
	fileSystem,
	fileExplorer,
	tabManager,
	windows,
} from '@/App'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import {
	ComputedRef,
	Ref,
	computed,
	onMounted,
	onUnmounted,
	ref,
	watch,
} from 'vue'
import { join } from '@/libs/path'
import { IPackType } from 'mc-project-core'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()

const currentProject = projectManager.useCurrentProject()

const currentProjectPackDefinitions: Ref<IPackType[]> = computed(() => {
	if (!currentProject.value) return []
	if (!(currentProject.value instanceof BedrockProject)) return []

	return currentProject.value.packDefinitions.filter((pack: IPackType) => {
		if (currentProject.value === null) return false
		if (currentProject.value.config === null) return false

		Object.keys(currentProject.value.config.packs).includes(pack.id)
	})
})

const selectedPack: Ref<string> = ref('')
const selectedPackDefinition: ComputedRef<IPackType | null> = computed(() => {
	if (!currentProject.value) return null
	if (!(currentProject.value instanceof BedrockProject)) return null

	return (
		currentProject.value.packDefinitions.find(
			(pack: IPackType) => pack.id === selectedPack.value
		) ?? null
	)
})
const selectedPackPath: ComputedRef<string> = computed(() => {
	if (!currentProject.value) return ''
	if (!(currentProject.value instanceof BedrockProject)) return ''

	return join(
		currentProject.value.path,
		currentProject.value.packDefinitions.find(
			(pack: IPackType) => pack.id === selectedPack.value
		)?.defaultPackPath ?? ''
	)
})

const entries: Ref<BaseEntry[]> = ref([])

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return
	if (!currentProject.value) return

	if (path !== selectedPackPath.value) return

	entries.value = await fileSystem.readDirectoryEntries(
		selectedPackPath.value
	)
}

watch(selectedPackPath, (path) => {
	updateEntries(path)
})

onMounted(async () => {
	fileSystem.eventSystem.on('updated', updateEntries)

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	selectedPack.value = currentProject.value.packDefinitions[0]?.id ?? ''

	updateEntries(selectedPackPath.value)
})

onUnmounted(() => {
	fileSystem.eventSystem.off('updated', updateEntries)
})

async function contextMenuBuild(close: any) {
	close()

	if (!currentProject.value) return
	if (!(currentProject.value instanceof BedrockProject)) return

	await currentProject.value.build()
}

async function contextMenuNewFile(close: any) {
	close()

	windows.open('presets')
}

async function contextMenuOpenProjectConfig(close: any) {
	close()

	tabManager.openFile(join(currentProject.value!.path, 'config.json'))
}
</script>

<template>
	<div
		class="self-stretch my-2 w-96 flex flex-col gap-2"
		v-if="fileExplorer.open.value"
	>
		<div class="bg-menuAlternate rounded h-16 flex items-center p-3 gap-3">
			<img
				:src="currentProject?.icon ?? ''"
				class="w-10 h-10 select-none"
			/>
			<p class="text-3xl select-none font-inter font-medium">
				{{ currentProject?.name }}
			</p>
		</div>

		<div class="bg-menuAlternate rounded flex-1 p-2">
			<div class="flex gap-2 mb-2" v-if="currentProject">
				<button
					v-for="packDefinition in currentProjectPackDefinitions"
					class="flex-1 flex items-center justify-center p-2 rounded border-2 hover:border-text transition-colors duration-100 ease-out"
					:class="{
						'bg-background border-background':
							packDefinition.id !== selectedPack,
						'bg-[var(--color)] border-[var(--color)]':
							packDefinition.id === selectedPack,
					}"
					:style="{
						'--color': `var(--theme-color-${packDefinition.color})`,
					}"
					@click="selectedPack = packDefinition.id"
				>
					<Icon
						:icon="packDefinition.icon"
						:color="
							packDefinition.id === selectedPack
								? 'text'
								: packDefinition.color
						"
					/>
				</button>

				<ContextMenu class="flex-1 basis-5">
					<template #main="{ toggle }">
						<button
							@click="toggle"
							class="flex w-full h-full items-center justify-center p-2 rounded bg-background hover:bg-primary transition-colors duration-100 ease-out"
						>
							<Icon icon="more_vert" />
						</button>
					</template>

					<template #menu="{ close }">
						<div
							class="w-52 bg-menuAlternate rounded mt-2 shadow-window overflow-hidden relative z-10"
						>
							<div
								@click="() => contextMenuNewFile(close)"
								class="flex item-center group hover:bg-menu p-2 cursor-pointer transition-colors duration-100 ease-out"
							>
								<Icon
									icon="add"
									class="text-base group-hover:text-primary transition-colors duration-100 ease-out"
								/>
								<span class="ml-2 font-inter select-none">{{
									t('New File')
								}}</span>
							</div>

							<div
								@click="() => contextMenuBuild(close)"
								class="flex item-center group hover:bg-menu p-2 cursor-pointer transition-colors duration-100 ease-out"
							>
								<Icon
									icon="manufacturing"
									class="text-base group-hover:text-primary transition-colors duration-100 ease-out"
								/>
								<span class="ml-2 font-inter select-none">{{
									t('Build')
								}}</span>
							</div>

							<div
								@click="
									() => contextMenuOpenProjectConfig(close)
								"
								class="flex item-center group hover:bg-menu p-2 cursor-pointer transition-colors duration-100 ease-out"
							>
								<Icon
									icon="settings"
									class="text-base group-hover:text-primary transition-colors duration-100 ease-out"
								/>
								<span class="ml-2 font-inter select-none">{{
									t('Open Project Config')
								}}</span>
							</div>
						</div>
					</template>
				</ContextMenu>
			</div>

			<div v-for="entry in entries" :key="entry.path">
				<File
					:path="entry.path"
					:color="selectedPackDefinition!.color"
					v-if="entry.type === 'file'"
				/>
				<Directory
					:path="entry.path"
					:color="selectedPackDefinition!.color"
					v-if="entry.type === 'directory'"
				/>
			</div>
		</div>
	</div>
</template>
