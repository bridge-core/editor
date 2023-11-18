<template>
	<Window name="Create Project" ref="window">
		<div class="flex flex-col">
			<div
				class="max-h-[35.675rem] overflow-y-scroll p-4 pt-2 m-4 mt-0 max-width overflow-x-auto"
			>
				<!-- Pack Types -->
				<div class="flex gap-3 mb-4">
					<InformativeToggle
						v-for="packType in packTypes"
						:icon="packType.icon"
						:color="packType.color"
						:name="t(`packType.${packType.id}.name`)"
						:description="t(`packType.${packType.id}.description`)"
						:selected="selectedPackTypes.includes(packType)"
						@click="selectPackType(packType)"
					>
						<div
							class="flex items-center my-4"
							v-if="packType.id === 'behaviorPack'"
						>
							<Switch
								class="mr-2"
								:model-value="linkBehaviourPack"
								@update:model-value="setLinkBehaviourPack"
							/>
							<span
								class="text-xs text-textAlternate select-none"
								>{{
									t('windows.createProject.rpAsBpDependency')
								}}</span
							>
						</div>

						<div
							class="flex items-center my-4"
							v-if="packType.id === 'resourcePack'"
						>
							<Switch
								class="mr-2"
								:model-value="linkResourcePack"
								@update:model-value="setLinkResourcePack"
							/>
							<span
								class="text-xs text-textAlternate select-none"
								>{{
									t('windows.createProject.bpAsRpDependency')
								}}</span
							>
						</div>
					</InformativeToggle>
				</div>

				<!-- Experiment Toggles -->
				<Expandable
					:name="t('general.experimentalGameplay')"
					class="mt-6"
				>
					<div class="flex flex-wrap gap-2">
						<InformativeToggle
							v-for="toggle in experimentalToggles"
							:icon="toggle.icon"
							color="primary"
							background="background"
							:name="t(`experimentalGameplay.${toggle.id}.name`)"
							:description="
								t(
									`experimentalGameplay.${toggle.id}.description`
								)
							"
							:selected="
								selectedExperimentalToggles.includes(toggle)
							"
							@click="selectExperimentalToggle(toggle)"
						/>
					</div>
				</Expandable>

				<!-- Files -->
				<Expandable
					:name="t('windows.createProject.individualFiles.name')"
					class="mt-6"
				>
					<div class="flex flex-wrap gap-2">
						<InformativeToggle
							v-for="file in availableConfigurableFiles"
							icon="draft"
							color="primary"
							background="background"
							:name="
								t(
									`windows.createProject.individualFiles.file.${file.id}.name`
								)
							"
							:description="
								t(
									`windows.createProject.individualFiles.file.${file.id}.description`
								)
							"
							:selected="selectedFiles.includes(file)"
							@click="selectFile(file)"
						/>
					</div>
				</Expandable>

				<div class="flex gap-4 w-full mt-4">
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
							class="flex align-center gap-2 text-textAlternate"
							@mouseenter="focus"
							@mouseleave="blur"
							@click="projectIconInput?.click()"
						>
							<Icon
								icon="image"
								class="no-fill"
								color="text-textAlternate"
							/>Project Icon (Optional)
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
						class="mb-4 flex-1"
						v-slot="{ focus, blur }"
					>
						<Dropdown @expanded="focus" @collapsed="blur">
							<template #main>
								<span>1.20.50</span>
							</template>

							<template #choices>
								<div>
									<span>1.20.51</span>
									<span>1.20.52</span>
									<span>1.20.53</span>
								</div>
							</template>
						</Dropdown>
					</LabeledInput>
				</div>
			</div>

			<Button
				icon="add"
				text="Create"
				@click="create"
				class="mt-4 mr-8 mb-8 self-end"
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
import InformativeToggle from '/@/components/Common/InformativeToggle.vue'
import Expandable from '/@/components/Common/Expandable.vue'
import Dropdown from '/@/components/Common/Dropdown.vue'

import { Ref, computed, onMounted, ref } from 'vue'
import { App } from '/@/App'
import { IPackType } from 'mc-project-core'
import { translate as t } from '/@/libs/locales/Locales'
import { ExperimentalToggle, Packs } from '/@/libs/projects/ProjectManager'
import { ConfigurableFile } from '/@/libs/projects/create/files/configurable/ConfigurableFile'

const projectIconInput: Ref<HTMLInputElement | null> = ref(null)
const window = ref<Window | null>(null)

const linkBehaviourPack = ref(false)
const linkResourcePack = ref(false)

function setLinkBehaviourPack(value: boolean) {
	if (
		!selectedPackTypes.value.find((pack) => pack.id === 'behaviorPack') ||
		!selectedPackTypes.value.find((pack) => pack.id === 'resourcePack')
	)
		return

	linkBehaviourPack.value = value
}

function setLinkResourcePack(value: boolean) {
	if (
		!selectedPackTypes.value.find((pack) => pack.id === 'behaviorPack') ||
		!selectedPackTypes.value.find((pack) => pack.id === 'resourcePack')
	)
		return

	linkResourcePack.value = value
}

const projectName: Ref<string> = ref('New Project')
const projectDescription: Ref<string> = ref('')
const projectNamespace: Ref<string> = ref('bridge')
const projectAuthor: Ref<string> = ref('')
const projectTargetVersion: Ref<string> = ref('1.20.50')
const projectIcon: Ref<File | null> = ref(null)

const packTypes: Ref<IPackType[]> = ref([])
const selectedPackTypes: Ref<IPackType[]> = ref([])
const experimentalToggles: Ref<ExperimentalToggle[]> = ref([])
const selectedExperimentalToggles: Ref<ExperimentalToggle[]> = ref([])
const availableConfigurableFiles = computed(() => {
	const files: ConfigurableFile[] = []

	for (const packType of selectedPackTypes.value) {
		const pack = Packs[packType.id]

		if (!pack) continue

		files.push(...pack.configurableFiles)
	}

	return files
})
const selectedFiles: Ref<ConfigurableFile[]> = ref([])

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
			configurableFiles: selectedFiles.value.map((file) => file.id),
		},
		fileSystem
	)

	window.value?.close()
}

function selectPackType(packType: IPackType) {
	if (selectedPackTypes.value.includes(packType)) {
		selectedPackTypes.value.splice(
			selectedPackTypes.value.indexOf(packType),
			1
		)
		selectedPackTypes.value = selectedPackTypes.value

		if (packType.id === 'behaviorPack' || packType.id === 'resourcePack') {
			linkBehaviourPack.value = false
			linkResourcePack.value = false
		}

		const pack = Packs[packType.id]

		if (pack) {
			for (const file of pack.configurableFiles) {
				if (!selectedFiles.value.includes(file)) continue

				selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1)
				selectedFiles.value = selectedFiles.value
			}
		}
	} else {
		selectedPackTypes.value.push(packType)
		selectedPackTypes.value = selectedPackTypes.value
	}
}

function selectExperimentalToggle(toggle: ExperimentalToggle) {
	if (selectedExperimentalToggles.value.includes(toggle)) {
		selectedExperimentalToggles.value.splice(
			selectedExperimentalToggles.value.indexOf(toggle),
			1
		)
		selectedExperimentalToggles.value = selectedExperimentalToggles.value
	} else {
		selectedExperimentalToggles.value.push(toggle)
		selectedExperimentalToggles.value = selectedExperimentalToggles.value
	}
}

function selectFile(file: ConfigurableFile) {
	if (selectedFiles.value.includes(file)) {
		selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1)
		selectedFiles.value = selectedFiles.value
	} else {
		selectedFiles.value.push(file)
		selectedFiles.value = selectedFiles.value
	}
}

function chooseProjectIcon() {
	if (!projectIconInput.value) return

	if (!projectIconInput.value.files) return

	if (!projectIconInput.value.files[0]) return

	projectIcon.value = projectIconInput.value.files[0]
}

onMounted(async () => {
	const data = App.instance.data

	packTypes.value = await data.get(
		'packages/minecraftBedrock/packDefinitions.json'
	)

	experimentalToggles.value = await data.get(
		'packages/minecraftBedrock/experimentalGameplay.json'
	)
})
</script>

<style scoped>
.max-width {
	max-width: min(90vw, 65.5rem);
}
</style>
