<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Icon from '@/components/Common/Icon.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Dropdown from '@/components/Common/Legacy/LegacyDropdown.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import TextButton from '@/components/Common/TextButton.vue'
import Expandable from '@/components/Common/Expandable.vue'
import InformativeToggle from '@/components/Common/InformativeToggle.vue'

import { ComputedRef, Ref, computed, onMounted, ref } from 'vue'
import { ExperimentalToggle, FormatVersionDefinitions, useGetData } from '@/libs/data/Data'
import { EditProjectWindow } from './EditProjectWindow'
import { useTranslate } from '@/libs/locales/Locales'
import { Windows } from '../Windows'
import { useIsMobile } from '@/libs/Mobile'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { IPackType } from 'mc-project-core'

const t = useTranslate()
const isMobile = useIsMobile()
const getData = useGetData()

const projectName: Ref<string> = ref(EditProjectWindow.projectInfo.config.name)
const projectDescription: Ref<string> = ref(EditProjectWindow.projectInfo.config.description)
const projectNamespace: Ref<string> = ref(EditProjectWindow.projectInfo.config.namespace)
const projectAuthor: Ref<string> = ref(EditProjectWindow.projectInfo.config.author)
const projectTargetVersion: Ref<string> = ref(EditProjectWindow.projectInfo.config.targetVersion)

const packTypes: Ref<IPackType[]> = ref([])
const selectedPackTypes: Ref<IPackType[]> = ref([])

const experimentalToggles: Ref<ExperimentalToggle[]> = ref([])
const selectedExperimentalToggles: Ref<ExperimentalToggle[]> = ref([])

const formatVersionDefinitions: Ref<FormatVersionDefinitions | null> = ref(null)

async function setup() {
	packTypes.value = (await getData.value('packages/minecraftBedrock/packDefinitions.json')) || []

	experimentalToggles.value = (await getData.value('packages/minecraftBedrock/experimentalGameplay.json')) || []

  selectedExperimentalToggles.value = experimentalToggles.value.filter(toggle => (EditProjectWindow.projectInfo.config.experimentalGameplay ?? {})[toggle.id])

	formatVersionDefinitions.value = <FormatVersionDefinitions>await getData.value('packages/minecraftBedrock/formatVersions.json') || []

	if (!formatVersionDefinitions.value) return

	projectTargetVersion.value = formatVersionDefinitions.value.currentStable
}

function validateProjectName(value: string): string | null {
	if (value === '') return 'windows.editProject.name.mustNotBeEmpty'
	if (value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null) return 'windows.editProject.name.invalidLetters'
	if (value.endsWith('.')) return 'windows.editProject.name.endsInPeriod'
	if (value !== EditProjectWindow.projectInfo.name && ProjectManager.projects.find((project) => project.name === value))
		return 'windows.editProject.name.alreadyExists'

	return null
}

function validateProjectNamespace(value: string): string | null {
	if (value.toLocaleLowerCase() !== value) return 'windows.editProject.namespace.invalidCharacters'
	if (value.includes(' ')) return 'windows.editProject.namespace.invalidCharacters'
	if (value.includes(':')) return 'windows.editProject.namespace.invalidCharacters'
	if (value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null) return 'windows.editProject.namespace.invalidCharacters'
	if (value === '') return 'windows.editProject.namespace.mustNotBeEmpty'

	return null
}

const validationError: ComputedRef<string | null> = computed(() => {
	if (projectName.value === '') return 'windows.editProject.name.mustNotBeEmpty'
	if (projectName.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null) return 'windows.editProject.name.invalidLetters'
	if (projectName.value.endsWith('.')) return 'windows.editProject.name.endsInPeriod'
	if (projectName.value !== EditProjectWindow.projectInfo.name && ProjectManager.projects.find((project) => project.name === projectName.value))
		return 'windows.editProject.name.alreadyExists'

	if (projectNamespace.value.toLocaleLowerCase() !== projectNamespace.value) return 'windows.editProject.namespace.invalidCharacters'
	if (projectNamespace.value.includes(' ')) return 'windows.editProject.namespace.invalidCharacters'
	if (projectNamespace.value.includes(':')) return 'windows.editProject.namespace.invalidCharacters'
	if (projectNamespace.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null) return 'windows.editProject.namespace.invalidCharacters'
	if (projectNamespace.value === '') return 'windows.editProject.namespace.mustNotBeEmpty'

	return null
})

function selectExperimentalToggle(toggle: ExperimentalToggle) {
  if (selectedExperimentalToggles.value.includes(toggle)) {
    selectedExperimentalToggles.value.splice(
      selectedExperimentalToggles.value.indexOf(toggle),
      1
    );
    selectedExperimentalToggles.value = selectedExperimentalToggles.value;
  } else {
    selectedExperimentalToggles.value.push(toggle);
    selectedExperimentalToggles.value = selectedExperimentalToggles.value;
  }
}

async function save() {
	if (validationError.value !== null) return

  ProjectManager.editProject(
    EditProjectWindow.projectInfo.name,
    {
      name: projectName.value,
      description: projectDescription.value,
      namespace: projectNamespace.value,
      author: projectAuthor.value,
      targetVersion: projectTargetVersion.value,
      experiments: Object.fromEntries(
        experimentalToggles.value.map((toggle) => [
          toggle.id,
          selectedExperimentalToggles.value.includes(toggle),
        ])
      ),
    }
  );

  Windows.close(EditProjectWindow);
}

onMounted(setup)
</script>

<template>
	<Window :name="t('windows.editProject.title')" @close="Windows.close(EditProjectWindow)">
		<div class="flex flex-col pb-8 grow" :class="{ 'h-[42.5rem] max-width': !isMobile }">
			<div class="overflow-auto p-4 pt-0 m-4 mt-2 basis-0 grow">
				<!-- Name -->
				<LabeledTextInput
					:label="t('windows.editProject.name.label')"
					class="h-min grow-[7]"
					v-model="projectName"
					:placeholder="t('windows.editProject.name.placeholder')"
					:rules="[validateProjectName]"
				/>

				<!-- Description -->
				<LabeledTextInput
					:label="t('windows.editProject.description.label')"
					class="mb-4 flex-1 h-min"
					v-model="projectDescription"
					:placeholder="t('windows.editProject.description.placeholder')"
				/>
				<div class="flex flex-wrap gap-x-4 mb-4">
					<!-- Namespace -->
					<LabeledTextInput
						:label="t('windows.editProject.namespace.label')"
						class="flex-1 h-min"
						v-model="projectNamespace"
						:placeholder="t('windows.editProject.namespace.placeholder')"
						:rules="[validateProjectNamespace]"
					/>

					<!-- Author -->
					<LabeledTextInput
						:label="t('windows.editProject.author.label')"
						class="flex-1 h-min mb-5"
						v-model="projectAuthor"
						:placeholder="t('windows.editProject.author.placeholder')"
					/>
				</div>

				<!-- Target Version -->
				<Dropdown class="flex-1">
					<template #main="{ expanded, toggle }">
						<LabeledInput :label="t('windows.editProject.targetVersion.label')" :focused="expanded" class="bg-background">
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
			</div>

			<div class="mx-8 flex justify-between items-center">
				<div class="flex items-center gap-2">
					<Icon v-if="validationError !== null" icon="error" class="text-sm text-error" />

					<p class="text-error font-theme text-xs h-min">
						{{ validationError !== null ? t(validationError) : '' }}
					</p>
				</div>

				<TextButton :text="t('Save')" @click="save" class="transition-[color, opacity]" :enabled="validationError === null" />
			</div>
		</div>
	</Window>
</template>

<style scoped>
.max-width {
  max-width: min(90vw, 67rem);
}

.light-scroll::-webkit-scrollbar-thumb {
  background-color: var(--theme-color-backgroundTertiary);
}
</style>