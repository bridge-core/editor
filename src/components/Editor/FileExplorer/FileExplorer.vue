<template>
	<div
		class="self-stretch my-2 w-96 flex flex-col gap-2"
		v-if="instance.open.value"
	>
		<div class="bg-menuAlternate rounded h-16 flex items-center p-3 gap-3">
			<img :src="currentProject?.icon ?? ''" class="w-10 h-10" />
			<p class="text-3xl">{{ currentProject?.name }}</p>
		</div>

		<div class="bg-menuAlternate rounded flex-1 p-2">
			<div class="flex gap-2 mb-2" v-if="currentProject">
				<button
					v-for="packDefinition in (<BedrockProjectData>currentProject.data).packDefinitions"
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
			</div>

			<div v-for="entry in entries">
				<File
					:name="basename(entry.path)"
					:color="selectedPackDefinition!.color"
					v-if="entry.type === 'file'"
				/>
				<Directory
					:name="basename(entry.path)"
					:color="selectedPackDefinition!.color"
					v-if="entry.type === 'directory'"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import File from './File.vue'
import Directory from './Directory.vue'
import Icon from '/@/components/Common/Icon.vue'

import { App } from '/@/App'
import { FileExplorer } from './FileExplorer'
import { BaseEntry } from '/@/libs/fileSystem/BaseFileSystem'
import {
	ComputedRef,
	Ref,
	computed,
	onMounted,
	onUnmounted,
	ref,
	watch,
} from 'vue'
import { basename, join } from '/@/libs/path'
import { BedrockProjectData } from '/@/libs/data/BedrockProjectData'
import { IPackType } from 'mc-project-core'

const currentProject = App.instance.projectManager.useCurrentProject()
let data: BedrockProjectData | null = currentProject.value
	? <BedrockProjectData>currentProject.value.data
	: null

const selectedPack: Ref<string> = ref('')
const selectedPackDefinition: ComputedRef<IPackType | null> = computed(() => {
	if (!data) return null

	return (
		data.packDefinitions.find((pack) => pack.id === selectedPack.value) ??
		null
	)
})
const selectedPackPath: ComputedRef<string> = computed(() => {
	if (!currentProject.value) return ''
	if (!data) return ''

	return join(
		currentProject.value.path,
		data.packDefinitions.find((pack) => pack.id === selectedPack.value)
			?.defaultPackPath ?? ''
	)
})

const entries: Ref<BaseEntry[]> = ref([])

async function updateEntries(path: unknown) {
	if (typeof path !== 'string') return
	if (!currentProject.value) return
	if (!data) return

	if (path !== selectedPackPath.value) return

	entries.value = await App.instance.fileSystem.readDirectoryEntries(
		selectedPackPath.value
	)
}

watch(selectedPackPath, (path) => {
	updateEntries(path)
})

onMounted(async () => {
	App.instance.fileSystem.eventSystem.on('updated', updateEntries)

	if (!currentProject.value) return
	if (!data) return

	selectedPack.value = data.packDefinitions[0]?.id ?? ''

	updateEntries(selectedPackPath.value)
})

onUnmounted(() => {
	App.instance.fileSystem.eventSystem.off('updated', updateEntries)
})

defineProps({
	instance: {
		type: FileExplorer,
		required: true,
	},
})
</script>
