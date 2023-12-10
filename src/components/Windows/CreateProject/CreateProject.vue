<template>
	<Window
		:name="t('windows.createProject.title')"
		id="createProject"
		ref="window"
	>
		<div class="flex flex-col">
			<div
				class="max-h-[36rem] overflow-y-scroll p-4 pt-2 m-4 mt-0 max-width overflow-x-auto"
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
								:model-value="linkResourcePack"
								@update:model-value="setLinkResourcePack"
							/>
							<span
								class="text-xs text-textAlternate select-none font-inter"
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
								:model-value="linkBehaviourPack"
								@update:model-value="setLinkBehaviourPack"
							/>
							<span
								class="text-xs text-textAlternate select-none font-inter"
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
						:label="t('windows.createProject.icon.label')"
						class="mb-4 flex bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							type="file"
							class="hidden"
							ref="projectIconInput"
							v-on:change="chooseProjectIcon"
						/>

						<button
							class="flex align-center gap-2 text-textAlternate font-inter"
							@mouseenter="focus"
							@mouseleave="blur"
							@click="projectIconInput?.click()"
						>
							<Icon
								icon="image"
								class="no-fill"
								color="text-textAlternate"
							/>
							{{ t('windows.createProject.icon.placeholder') }}
						</button>
					</LabeledInput>

					<LabeledInput
						:label="t('windows.createProject.name.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none max-w-none w-full placeholder:text-textAlternate font-inter"
							@focus="focus"
							@blur="blur"
							v-model="projectName"
							:placeholder="
								t('windows.createProject.name.placeholder')
							"
						/>
					</LabeledInput>
				</div>

				<LabeledInput
					:label="t('windows.createProject.description.label')"
					class="mb-4 bg-background"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none placeholder:text-textAlternate max-w-none w-full font-inter"
						@focus="focus"
						@blur="blur"
						v-model="projectDescription"
						:placeholder="
							t('windows.createProject.description.placeholder')
						"
					/>
				</LabeledInput>

				<div class="flex gap-4">
					<LabeledInput
						:label="t('windows.createProject.namespace.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full font-inter"
							@focus="focus"
							@blur="blur"
							v-model="projectNamespace"
							:placeholder="
								t('windows.createProject.namespace.placeholder')
							"
						/>
					</LabeledInput>

					<LabeledInput
						:label="t('windows.createProject.author.label')"
						class="mb-4 flex-1 bg-background"
						v-slot="{ focus, blur }"
					>
						<input
							class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full font-inter"
							@focus="focus"
							@blur="blur"
							v-model="projectAuthor"
							:placeholder="
								t('windows.createProject.author.placeholder')
							"
						/>
					</LabeledInput>

					<Dropdown class="mb-4 flex-1">
						<template #main="{ expanded, toggle }">
							<LabeledInput
								:label="
									t(
										'windows.createProject.targetVersion.label'
									)
								"
								:focused="expanded"
								class="bg-background"
							>
								<div
									class="flex items-center justify-between cursor-pointer"
									@click="toggle"
								>
									<span class="font-inter">{{
										projectTargetVersion
									}}</span>

									<Icon
										icon="arrow_drop_down"
										class="transition-transform duration-200 ease-out"
										:class="{ '-rotate-180': expanded }"
									/>
								</div>
							</LabeledInput>
						</template>

						<template #choices="{ collapse }">
							<div
								class="mt-2 bg-menuAlternate w-full p-1 rounded"
							>
								<div
									class="flex flex-col max-h-[12rem] overflow-y-auto p-1"
								>
									<button
										v-for="version in formatVersionDefinitions?.formatVersions
											.slice()
											.reverse()"
										@click="
											() => {
												projectTargetVersion = version
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-inter"
										:class="{
											'bg-menu':
												projectTargetVersion ===
												version,
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

			<Button
				icon="add"
				text="Create"
				@click="create"
				class="mt-4 mr-8 mb-8 self-end transition-[color, opacity] font-inter"
				:enabled="dataValid"
			/>
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import Icon from '@/components/Common/Icon.vue'
import Switch from '@/components/Common/Switch.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import InformativeToggle from '@/components/Common/InformativeToggle.vue'
import Expandable from '@/components/Common/Expandable.vue'
import Dropdown from '@/components/Common/Dropdown.vue'

import { Ref, computed, onMounted, ref, watch } from 'vue'
import { IPackType } from 'mc-project-core'
import { packs } from '@/libs/project/ProjectManager'
import { ConfigurableFile } from '@/libs/project/create/files/configurable/ConfigurableFile'
import { FormatVersionDefinitions, ExperimentalToggle } from '@/libs/data/Data'
import { v4 as uuid } from 'uuid'
import { useTranslate } from '@/libs/locales/Locales'
import { data, fileSystem, projectManager } from '@/App'

const t = useTranslate()

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
		const pack = packs[packType.id]

		if (!pack) continue

		files.push(...pack.configurableFiles)
	}

	return files
})
const selectedFiles: Ref<ConfigurableFile[]> = ref([])
const formatVersionDefinitions: Ref<FormatVersionDefinitions | null> = ref(null)

const dataValid = computed(() => {
	if (projectName.value === '') return false
	if (projectName.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null)
		return false
	if (projectName.value.endsWith('.')) return false

	if (projectNamespace.value.toLocaleLowerCase() !== projectNamespace.value)
		return false
	if (projectNamespace.value.includes(' ')) return false
	if (projectNamespace.value.includes(':')) return false
	if (projectNamespace.value === '') return false

	return true
})

async function create() {
	if (!dataValid.value) return

	projectManager.createProject(
		{
			name: projectName.value,
			description: projectDescription.value,
			namespace: projectNamespace.value,
			author: projectAuthor.value,
			targetVersion: projectTargetVersion.value,
			icon:
				projectIcon.value ??
				(await data.getRaw(`packages/common/packIcon.png`)),
			packs: [
				'bridge',
				...selectedPackTypes.value.map((pack) => pack.id),
			],
			configurableFiles: selectedFiles.value.map((file) => file.id),
			rpAsBpDependency: linkResourcePack.value,
			bpAsRpDependency: linkBehaviourPack.value,
			uuids: Object.fromEntries(
				selectedPackTypes.value.map((packType) => [packType.id, uuid()])
			),
			experiments: selectedExperimentalToggles.value.map(
				(toggle) => toggle.id
			),
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
	packTypes.value = await data.get(
		'packages/minecraftBedrock/packDefinitions.json'
	)

	experimentalToggles.value = await data.get(
		'packages/minecraftBedrock/experimentalGameplay.json'
	)

	formatVersionDefinitions.value = <FormatVersionDefinitions>(
		await data.get('packages/minecraftBedrock/formatVersions.json')
	)

	projectTargetVersion.value = formatVersionDefinitions.value.currentStable
})
</script>

<style scoped>
.max-width {
	max-width: min(90vw, 65.5rem);
}
</style>
