<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import Icon from '@/components/Common/Icon.vue'
import Switch from '@/components/Common/Switch.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import InformativeToggle from '@/components/Common/InformativeToggle.vue'
import Expandable from '@/components/Common/Expandable.vue'
import Dropdown from '@/components/Common/LegacyDropdown.vue'

import { Ref, computed, onMounted, ref, watch } from 'vue'
import { IPackType, PackType } from 'mc-project-core'
import { ProjectManager, packs } from '@/libs/project/ProjectManager'
import { ConfigurableFile } from '@/libs/project/create/files/configurable/ConfigurableFile'
import { FormatVersionDefinitions, ExperimentalToggle, useGetData, Data } from '@/libs/data/Data'
import { v4 as uuid } from 'uuid'
import { useTranslate } from '@/libs/locales/Locales'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Windows } from '../Windows'
import { CreateProjectWindow } from './CreateProjectWindow'
import TextButton from '@/components/Common/TextButton.vue'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()
const getData = useGetData()

const projectIconInput: Ref<HTMLInputElement | null> = ref(null)

const linkBehaviourPack = ref(false)
const linkResourcePack = ref(false)

function setLinkBehaviourPack(value: boolean) {
	if (!selectedPackTypes.value.find((pack) => pack.id === 'behaviorPack'))
		selectPackType(packTypes.value.find((packType) => packType.id === 'behaviorPack')!)
	if (!selectedPackTypes.value.find((pack) => pack.id === 'resourcePack'))
		selectPackType(packTypes.value.find((packType) => packType.id === 'resourcePack')!)

	linkBehaviourPack.value = value
}

function setLinkResourcePack(value: boolean) {
	if (!selectedPackTypes.value.find((pack) => pack.id === 'behaviorPack'))
		selectPackType(packTypes.value.find((packType) => packType.id === 'behaviorPack')!)
	if (!selectedPackTypes.value.find((pack) => pack.id === 'resourcePack'))
		selectPackType(packTypes.value.find((packType) => packType.id === 'resourcePack')!)

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

async function setup() {
	packTypes.value = (await getData.value('packages/minecraftBedrock/packDefinitions.json')) || []

	experimentalToggles.value = (await getData.value('packages/minecraftBedrock/experimentalGameplay.json')) || []

	formatVersionDefinitions.value =
		<FormatVersionDefinitions>await getData.value('packages/minecraftBedrock/formatVersions.json') || []

	if (!formatVersionDefinitions.value) return

	projectTargetVersion.value = formatVersionDefinitions.value.currentStable
}

watch(getData, setup)

const availableConfigurableFiles = computed(() => {
	const files: ConfigurableFile[] = []

	for (const packType of selectedPackTypes.value) {
		const pack = packs[packType.id]

		if (!pack) continue

		files.push(...pack.configurableFiles)
	}

	return files
})

const selectedFiles: Ref<ConfigurableFile[]> = ref([])
const formatVersionDefinitions: Ref<FormatVersionDefinitions | null> = ref(null)

const dataValid = computed(() => {
	if (selectedPackTypes.value.length === 0) return false
	if (projectName.value === '') return false
	if (projectName.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null) return false
	if (projectName.value.endsWith('.')) return false

	if (projectNamespace.value.toLocaleLowerCase() !== projectNamespace.value) return false
	if (projectNamespace.value.includes(' ')) return false
	if (projectNamespace.value.includes(':')) return false
	if (projectNamespace.value === '') return false

	return true
})

async function create() {
	if (!dataValid.value) return

	ProjectManager.createProject(
		{
			name: projectName.value,
			description: projectDescription.value,
			namespace: projectNamespace.value,
			author: projectAuthor.value,
			targetVersion: projectTargetVersion.value,
			icon: projectIcon.value ?? (await Data.getRaw(`packages/common/packIcon.png`)),
			packs: ['bridge', ...selectedPackTypes.value.map((pack) => pack.id)],
			configurableFiles: selectedFiles.value.map((file) => file.id),
			rpAsBpDependency: linkResourcePack.value,
			bpAsRpDependency: linkBehaviourPack.value,
			uuids: Object.fromEntries(selectedPackTypes.value.map((packType) => [packType.id, uuid()])),
			experiments: Object.fromEntries(
				experimentalToggles.value.map((toggle) => [
					toggle.id,
					selectedExperimentalToggles.value.includes(toggle),
				])
			),
		},
		fileSystem
	)

	Windows.close(CreateProjectWindow)
}

function selectPackType(packType: IPackType) {
	if (selectedPackTypes.value.includes(packType)) {
		selectedPackTypes.value.splice(selectedPackTypes.value.indexOf(packType), 1)
		selectedPackTypes.value = selectedPackTypes.value

		if (packType.id === 'behaviorPack' || packType.id === 'resourcePack') {
			linkBehaviourPack.value = false
			linkResourcePack.value = false
		}

		const pack = packs[packType.id]

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
		selectedExperimentalToggles.value.splice(selectedExperimentalToggles.value.indexOf(toggle), 1)
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

onMounted(setup)

const isMobile = useIsMobile()
</script>

<template>
	<Window :name="t('windows.createProject.title')" @close="Windows.close(CreateProjectWindow)">
		<div class="flex flex-col pb-8 grow" :class="{ 'h-[42rem]': !isMobile }">
			<div class="overflow-y-scroll p-4 pt-2 m-4 mt-0 max-width overflow-x-auto basis-0 grow">
				<!-- Pack Types -->
				<div class="flex justify-stretch flex-wrap gap-3 mb-4">
					<InformativeToggle
						v-for="packType in packTypes"
						:icon="packType.icon"
						:color="packType.color"
						:name="t(`packType.${packType.id}.name`)"
						:description="t(`packType.${packType.id}.description`)"
						:selected="selectedPackTypes.includes(packType)"
						@click="selectPackType(packType)"
					>
						<div class="flex items-center my-4" v-if="packType.id === 'behaviorPack'">
							<Switch
								class="mr-2"
								border-color="backgroundTertiary"
								:model-value="linkResourcePack"
								@update:model-value="setLinkResourcePack"
							/>
							<span class="text-xs text-text-secondary select-none font-theme">{{
								t('windows.createProject.rpAsBpDependency')
							}}</span>
						</div>

						<div class="flex items-center my-4" v-if="packType.id === 'resourcePack'">
							<Switch
								class="mr-2"
								border-color="backgroundTertiary"
								:model-value="linkBehaviourPack"
								@update:model-value="setLinkBehaviourPack"
							/>
							<span class="text-xs text-text-secondary select-none font-theme">{{
								t('windows.createProject.bpAsRpDependency')
							}}</span>
						</div>
					</InformativeToggle>
				</div>

				<!-- Experiment Toggles -->
				<Expandable :name="t('general.experimentalGameplay')" class="mt-6">
					<div class="flex flex-wrap gap-2">
						<InformativeToggle
							v-for="toggle in experimentalToggles"
							:icon="toggle.icon"
							color="primary"
							background="background"
							:name="t(`experimentalGameplay.${toggle.id}.name`)"
							:description="t(`experimentalGameplay.${toggle.id}.description`)"
							:selected="selectedExperimentalToggles.includes(toggle)"
							@click="selectExperimentalToggle(toggle)"
						/>
					</div>
				</Expandable>

				<!-- Files -->
				<Expandable :name="t('windows.createProject.individualFiles.name')" class="mt-6">
					<div class="flex flex-wrap gap-2">
						<InformativeToggle
							v-for="file in availableConfigurableFiles"
							icon="draft"
							color="primary"
							background="background"
							:name="t(`windows.createProject.individualFiles.file.${file.id}.name`)"
							:description="t(`windows.createProject.individualFiles.file.${file.id}.description`)"
							:selected="selectedFiles.includes(file)"
							@click="selectFile(file)"
						/>
					</div>
				</Expandable>

				<div class="flex gap-4 w-full mt-4">
					<LabeledInput
						:label="t('windows.createProject.icon.label')"
						class="mb-4 flex bg-background"
						v-slot="{ focus, blur }"
					>
						<input type="file" class="hidden" ref="projectIconInput" @:change="chooseProjectIcon" />

						<button
							class="flex align-center gap-2 text-text-secondary font-theme"
							@mouseenter="focus"
							@mouseleave="blur"
							@click="projectIconInput?.click()"
						>
							<Icon icon="image" class="no-fill" color="text-text-secondary" />
							{{ t('windows.createProject.icon.placeholder') }}
						</button>
					</LabeledInput>

					<LabeledInput
						:label="t('windows.createProject.name.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none max-w-none w-full placeholder:text-text-secondary font-theme"
							@focus="focus"
							@blur="blur"
							v-model="projectName"
							:placeholder="t('windows.createProject.name.placeholder')"
						/>
					</LabeledInput>
				</div>

				<LabeledInput
					:label="t('windows.createProject.description.label')"
					class="mb-4 bg-background"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none placeholder:text-text-secondary max-w-none w-full font-theme"
						@focus="focus"
						@blur="blur"
						v-model="projectDescription"
						:placeholder="t('windows.createProject.description.placeholder')"
					/>
				</LabeledInput>

				<div class="flex gap-4">
					<LabeledInput
						:label="t('windows.createProject.namespace.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none placeholder:text-text-secondary max-w-none w-full font-theme"
							@focus="focus"
							@blur="blur"
							v-model="projectNamespace"
							:placeholder="t('windows.createProject.namespace.placeholder')"
						/>
					</LabeledInput>

					<LabeledInput
						:label="t('windows.createProject.author.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none placeholder:text-text-secondary max-w-none w-full font-theme"
							@focus="focus"
							@blur="blur"
							v-model="projectAuthor"
							:placeholder="t('windows.createProject.author.placeholder')"
						/>
					</LabeledInput>

					<Dropdown class="mb-4 flex-1">
						<template #main="{ expanded, toggle }">
							<LabeledInput
								:label="t('windows.createProject.targetVersion.label')"
								:focused="expanded"
								class="bg-background"
							>
								<div class="flex items-center justify-between cursor-pointer" @click="toggle">
									<span class="font-theme">{{ projectTargetVersion }}</span>

									<Icon
										icon="arrow_drop_down"
										class="transition-transform duration-200 ease-out"
										:class="{ '-rotate-180': expanded }"
									/>
								</div>
							</LabeledInput>
						</template>

						<template #choices="{ collapse }">
							<div class="mt-2 bg-background-secondary w-full p-1 rounded">
								<div class="flex flex-col max-h-[6.5rem] overflow-y-auto p-1 light-scroll">
									<button
										v-for="version in formatVersionDefinitions?.formatVersions.slice().reverse()"
										@click="
											() => {
												projectTargetVersion = version
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-theme"
										:class="{
											'bg-background-tertiary': projectTargetVersion === version,
										}"
									>
										{{ version }}
									</button>
								</div>
							</div>
						</template>
					</Dropdown>
				</div>
			</div>

			<TextButton
				:text="t('Create')"
				@click="create"
				class="mt-4 mr-8 self-end transition-[color, opacity]"
				:enabled="dataValid"
			/>
		</div>
	</Window>
</template>

<style scoped>
.max-width {
	max-width: min(90vw, 65.5rem);
}

.light-scroll::-webkit-scrollbar-thumb {
	background-color: var(--theme-color-backgroundTertiary);
}
</style>
