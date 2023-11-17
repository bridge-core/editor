<template>
	<Window name="Create Project" ref="window">
		<div class="flex flex-col">
			<div class="max-h-[34.625rem] overflow-y-scroll p-4 pt-2 m-4 mt-0">
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
							<Switch class="mr-2" v-model="linkBehaviourPack" />
							<span class="text-xs text-textAlternate">{{
								t('windows.createProject.rpAsBpDependency')
							}}</span>
						</div>

						<div
							class="flex items-center my-4"
							v-if="packType.id === 'resourcePack'"
						>
							<Switch class="mr-2" v-model="linkResourcePack" />
							<span class="text-xs text-textAlternate">{{
								t('windows.createProject.bpAsRpDependency')
							}}</span>
						</div>
					</InformativeToggle>
				</div>

				<Expandable
					:name="t('general.experimentalGameplay')"
					class="mt-2"
				>
					<div class="flex flex-wrap justify-center gap-2">
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
							:selected="false"
						/>
					</div>
				</Expandable>

				<Expandable
					:name="t('windows.createProject.individualFiles.name')"
					class="mt-4"
				>
					<InformativeToggle
						icon="draft"
						color="primary"
						background="background"
						name="player.json"
						description="A Cool file"
						:selected="false"
					/>
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

import { Ref, onMounted, ref } from 'vue'
import { App } from '/@/App'
import { IPackType } from 'mc-project-core'
import { translate as t } from '/@/libs/locales/Locales'
import { IExperimentalToggle } from '/@/libs/projects/ProjectManager'

const projectIconInput: Ref<HTMLInputElement | null> = ref(null)
const window = ref<Window | null>(null)

const linkBehaviourPack = ref(false)
const linkResourcePack = ref(false)

const projectName: Ref<string> = ref('New Project')
const projectDescription: Ref<string> = ref('')
const projectNamespace: Ref<string> = ref('bridge')
const projectAuthor: Ref<string> = ref('')
const projectTargetVersion: Ref<string> = ref('1.20.50')
const projectIcon: Ref<File | null> = ref(null)

const packTypes: Ref<IPackType[]> = ref([])
const selectedPackTypes: Ref<IPackType[]> = ref([])
const experimentalToggles: Ref<IExperimentalToggle[]> = ref([])

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
	const data = App.instance.data

	packTypes.value = await data.get(
		'packages/minecraftBedrock/packDefinitions.json'
	)

	experimentalToggles.value = await data.get(
		'packages/minecraftBedrock/experimentalGameplay.json'
	)
})
</script>
