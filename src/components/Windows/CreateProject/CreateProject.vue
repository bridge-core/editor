<template>
	<Window name="Create Project" ref="window">
		<div class="p-8 pt-2 flex flex-col">
			<div class="flex gap-3 mb-4">
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
						class="bg-background outline-none max-w-none w-full placeholder:italic placeholder:text-menu placeholder:opacity-100"
						@focus="focus"
						@blur="blur"
						v-model="projectName"
						placeholder="Name"
					/>
				</LabeledInput>

				<LabeledInput
					label="Icon"
					class="mb-4 flex"
					v-slot="{ focus, blur }"
				>
					<input
						type="file"
						class="hidden"
						ref="projectIconInput"
						v-on:change="chooseProjectIcon"
					/>

					<button
						class="flex align-center gap-2"
						@mouseenter="focus"
						@mouseleave="blur"
						@click="projectIconInput?.click()"
					>
						<Icon icon="image" />Project Icon (Optional)
					</button>
				</LabeledInput>
			</div>

			<LabeledInput
				label="Description"
				class="mb-4"
				v-slot="{ focus, blur }"
			>
				<input
					class="bg-background outline-none max-w-none placeholder:italic placeholder:text-menu placeholder:opacity-100"
					@focus="focus"
					@blur="blur"
					v-model="projectDescription"
					placeholder="Description (Optional)"
				/>
			</LabeledInput>

			<div class="flex gap-4">
				<LabeledInput
					label="Namespace"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:italic placeholder:text-menu placeholder:opacity-100"
						@focus="focus"
						@blur="blur"
						v-model="projectNamespace"
						placeholder="Namespace"
					/>
				</LabeledInput>

				<LabeledInput
					label="Author"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:italic placeholder:text-menu placeholder:opacity-100"
						@focus="focus"
						@blur="blur"
						v-model="projectAuthor"
						placeholder="Author (Optional)"
					/>
				</LabeledInput>

				<LabeledInput
					label="Target Version"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:italic placeholder:text-menu placeholder:opacity-100"
						@focus="focus"
						@blur="blur"
						v-model="projectTargetVersion"
					/>
				</LabeledInput>
			</div>

			<Button text="Create" @click="create" class="self-center mt-4" />
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '/@/components/Windows/Window.vue'
import Button from '/@/components/Common/Button.vue'
import Icon from '/@/components/Common/Icon.vue'
import LabeledInput from '/@/components/Common/LabeledInput.vue'
import PackType from './PackType.vue'

import { Ref, onMounted, ref } from 'vue'
import { App } from '/@/App'
import { join } from '/@/libs/path'
import { createBridgePack } from './Packs/Bridge'
import { createBehaviourPack } from './Packs/BehaviourPack'
import { createResourcePack } from './Packs/ResourcePack'

const projectIconInput: Ref<HTMLInputElement | null> = ref(null)
const window = ref<Window | null>(null)

const projectName: Ref<string> = ref('New Project')
const projectDescription: Ref<string> = ref('')
const projectNamespace: Ref<string> = ref('bridge')
const projectAuthor: Ref<string> = ref('')
const projectTargetVersion: Ref<string> = ref('1.20.50')
const projectIcon: Ref<File | null> = ref(null)

const packTypes: Ref<any> = ref([])
const selectedPackTypes: Ref<any> = ref([])

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

function chooseProjectIcon(event: Event) {
	if (!projectIconInput.value) return

	if (!projectIconInput.value.files) return

	if (!projectIconInput.value.files[0]) return

	projectIcon.value = projectIconInput.value.files[0]
}

onMounted(async () => {
	packTypes.value = await App.instance.data.get(
		'packages/minecraftBedrock/packDefinitions.json'
	)
})
</script>
