<template>
	<Window name="Create Project" ref="window">
		<div class="p-8 pt-2 flex flex-col">
			<div class="flex gap-3 mb-4">
				<PackType
					v-for="packType in packTypes"
					:pack-type="packType"
					:selected="selectedPackTypes.includes(packType)"
					@click="selectPackType(packType)"
				>
					<div
						class="flex items-center my-4"
						v-if="packType.id === 'behaviorPack'"
					>
						<Switch class="mr-2" v-model="linkPack" />
						<span class="text-sm text-textAlternate">{{
							t('windows.createProject.rpAsBpDependency')
						}}</span>
					</div>

					<div
						class="flex items-center my-4"
						v-if="packType.id === 'resourcePack'"
					>
						<Switch class="mr-2" v-model="linkPack" />
						<span class="text-sm text-textAlternate">{{
							t('windows.createProject.bpAsRpDependency')
						}}</span>
					</div>
				</PackType>
			</div>

			<div class="flex gap-4 w-full">
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
						<Icon icon="image" class="no-fill" />Project Icon
						(Optional)
					</button>
				</LabeledInput>

				<LabeledInput
					label="Name"
					class="mb-4 flex-1"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none w-full placeholder:text-textAlternate"
						@focus="focus"
						@blur="blur"
						v-model="projectName"
						placeholder="Project Name"
					/>
				</LabeledInput>
			</div>

			<LabeledInput
				label="Description"
				class="mb-4"
				v-slot="{ focus, blur }"
			>
				<input
					class="bg-background outline-none max-w-none placeholder:text-textAlternate max-w-none w-full"
					@focus="focus"
					@blur="blur"
					v-model="projectDescription"
					placeholder="Project Description (Optional)"
				/>
			</LabeledInput>

			<div class="flex gap-4">
				<LabeledInput
					label="Namespace"
					class="mb-4 flex-1"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full"
						@focus="focus"
						@blur="blur"
						v-model="projectNamespace"
						placeholder="Project Namespace"
					/>
				</LabeledInput>

				<LabeledInput
					label="Author"
					class="mb-4 flex-1"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full"
						@focus="focus"
						@blur="blur"
						v-model="projectAuthor"
						placeholder="Project Author (Optional)"
					/>
				</LabeledInput>

				<LabeledInput
					label="Target Version"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full"
						@focus="focus"
						@blur="blur"
						v-model="projectTargetVersion"
					/>
				</LabeledInput>
			</div>

			<Button
				icon="add"
				text="Create"
				@click="create"
				class="mt-4 self-end"
			/>
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '/@/components/Windows/Window.vue'
import Button from '/@/components/Common/Button.vue'
import Icon from '/@/components/Common/Icon.vue'
import Switch from '/@/components/Common/Switch.vue'
import LabeledInput from '/@/components/Common/LabeledInput.vue'
import PackType from './PackType.vue'

import { Ref, onMounted, ref } from 'vue'
import { App } from '/@/App'
import { IPackType } from 'mc-project-core'
import { translate as t } from '/@/libs/locales/Locales'

const projectIconInput: Ref<HTMLInputElement | null> = ref(null)
const window = ref<Window | null>(null)

const linkPack = ref(false)

const projectName: Ref<string> = ref('New Project')
const projectDescription: Ref<string> = ref('')
const projectNamespace: Ref<string> = ref('bridge')
const projectAuthor: Ref<string> = ref('')
const projectTargetVersion: Ref<string> = ref('1.20.50')
const projectIcon: Ref<File | null> = ref(null)

const packTypes: Ref<IPackType[]> = ref([])
const selectedPackTypes: Ref<IPackType[]> = ref([])

async function create() {
	const fileSystem = App.instance.fileSystem

	App.instance.projectManager.createProject(
		{
			name: projectName.value,
			description: projectDescription.value,
			namespace: projectNamespace.value,
			author: projectAuthor.value,
			targetVersion: projectTargetVersion.value,
			icon:
				projectIcon.value ??
				(await App.instance.data.getRaw(
					`packages/common/packIcon.png`
				)),
			packs: [
				'bridge.',
				...selectedPackTypes.value.map((pack) => pack.id),
			],
		},
		fileSystem
	)

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
