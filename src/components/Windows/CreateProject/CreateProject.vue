<template>
	<Window name="Create Project" ref="window">
		<div class="p-8 flex flex-col">
			<div class="flex gap-3 mb-2">
				<PackType
					v-for="(packType, i) in packTypes"
					:pack-type="packType"
					:selected="selectedPackTypes.includes(packType)"
					@click="selectPackType(packType)"
				/>
			</div>

			<div class="flex gap-4 w-full">
				<LabeledInput
					label="Name"
					class="mb-4 flex-1"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none w-full"
						@focus="focus"
						@blur="blur"
						v-model="projectName"
					/>
				</LabeledInput>

				<LabeledInput
					label="Icon"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>
			</div>

			<LabeledInput
				label="Description"
				class="mb-4"
				v-slot="{ focus, blur }"
			>
				<input
					class="bg-background outline-none max-w-none"
					value="Test"
					@focus="focus"
					@blur="blur"
				/>
			</LabeledInput>

			<div class="flex gap-4">
				<LabeledInput
					label="Namespace"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>

				<LabeledInput
					label="Author"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>

				<LabeledInput
					label="Target Version"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>
			</div>

			<Button text="Create" @click="create" class="self-center" />
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '/@/components/Windows/Window.vue'
import Button from '/@/components/Common/Button.vue'
import LabeledInput from '/@/components/Common/LabeledInput.vue'
import PackType from './PackType.vue'

import { Ref, onMounted, ref } from 'vue'
import { App } from '/@/App'
import { join } from '/@/libs/path'
import { createBridgePack } from './Packs/Bridge'
import { createBehaviourPack } from './Packs/BehaviourPack'
import { createResourcePack } from './Packs/ResourcePack'

const projectName: Ref<string> = ref('New Project')

const packTypes: Ref<any> = ref([])
const selectedPackTypes: Ref<any> = ref([])

const window = ref<Window | null>(null)

async function create() {
	const fileSystem = App.instance.fileSystem

	const projectPath = join('projects', projectName.value)

	await fileSystem.makeDirectory(projectPath)

	await createBridgePack(fileSystem, projectPath)

	if (selectedPackTypes.value.find((pack: any) => pack.id === 'behaviorPack'))
		await createBehaviourPack(fileSystem, projectPath)

	if (selectedPackTypes.value.find((pack: any) => pack.id === 'resourcePack'))
		await createResourcePack(fileSystem, projectPath)

	window.value?.close()
}

function selectPackType(packType: any) {
	if (selectedPackTypes.value.includes(packType)) {
		selectedPackTypes.value.splice(
			selectedPackTypes.value.indexOf(packType),
			1
		)
		selectedPackTypes.value = selectedPackTypes.value
	} else {
		selectedPackTypes.value.push(packType)
		selectedPackTypes.value = selectedPackTypes.value
	}
}

onMounted(async () => {
	packTypes.value = await App.instance.data.get(
		'packages/minecraftBedrock/packDefinitions.json'
	)
})
</script>
