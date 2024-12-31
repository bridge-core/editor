<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Expandable from '@/components/Common/Expandable.vue'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import Switch from '@/components/Common/Switch.vue'
import Dropdown from '@/components/Common/LegacyDropdown.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ComputedRef, Ref, computed, ref, watch } from 'vue'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Windows } from '../Windows'
import { PresetsWindow } from './PresetsWindow'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()
const isMobile = useIsMobile()

const selectedPresetPath: Ref<string | null> = ref(null)

const selectedPreset: ComputedRef<null | any> = computed(() => {
	if (selectedPresetPath.value === null) return null

	return availablePresets.value[selectedPresetPath.value]
})

const createPresetOptions: Ref<any> = ref({})

watch(selectedPreset, () => {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return
	if (!selectedPresetPath.value) return

	createPresetOptions.value = ProjectManager.currentProject.presetData.getDefaultPresetOptions(selectedPresetPath.value)
})

let availablePresets: Ref<{ [key: string]: any }> = ref({})

if (ProjectManager.currentProject && ProjectManager.currentProject instanceof BedrockProject) {
	availablePresets = ProjectManager.currentProject.presetData.useAvailablePresets()

	selectedPresetPath.value = Object.keys(availablePresets.value)[0] ?? null
}

const categories: ComputedRef<{ [key: string]: string[] }> = computed(() => {
	const categories: { [key: string]: string[] } = {}

	for (const [presetPath, preset] of Object.entries(availablePresets.value)) {
		if (!categories[preset.category]) categories[preset.category] = []

		categories[preset.category].push(presetPath)
	}

	return categories
})

async function create() {
	if (selectedPresetPath.value === null) return

	if (!ProjectManager.currentProject) return

	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	Windows.close(PresetsWindow)

	await ProjectManager.currentProject.presetData.createPreset(selectedPresetPath.value, createPresetOptions.value)
}

const search = ref('')

const expandables: Ref<(typeof Expandable)[]> = ref([])

const filteredCategories = computed(() => {
	return Object.keys(categories.value).filter(
		(category) => categories.value[category].filter((presetPath) => availablePresets.value[presetPath].name.toLowerCase().includes(search.value.toLowerCase())).length > 0
	)
})

watch(filteredCategories, () => {
	for (const expandable of expandables.value) {
		expandable.open()
	}
})
</script>

<template>
	<SidebarWindow :name="t('windows.createPreset.title')" @close="Windows.close(PresetsWindow)">
		<template #sidebar="{ hide }">
			<div class="p-4">
				<LabeledInput v-slot="{ focus, blur }" :label="t('Search Presets')" class="bg-background-secondary !mt-1 mb-2" border-color="backgroundTertiary">
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-theme" v-model="search" />
					</div>
				</LabeledInput>

				<div class="overflow-y-scroll max-h-[34rem]">
					<Expandable v-for="category of filteredCategories" :key="category" :name="t(category)" ref="expandables">
						<div class="flex flex-col">
							<button
								v-for="presetPath of categories[category].filter((presetPath) => availablePresets[presetPath].name.toLowerCase().includes(search.toLowerCase()))"
								:key="presetPath"
								class="flex align-center gap-2 border-transparent hover:border-text border-2 transition-colors duration-100 ease-out rounded p-2 mt-1"
								:class="{
									'bg-primary': selectedPresetPath === presetPath,
								}"
								@click="
									() => {
										selectedPresetPath = presetPath
										hide()
									}
								"
							>
								<Icon
									:icon="availablePresets[presetPath].icon"
									class="text-base transition-colors duration-100 ease-out"
									:class="{
										'text-text': selectedPresetPath === presetPath,
										'text-primary': selectedPresetPath !== presetPath,
									}"
								/>
								<span class="font-theme select-none">{{ availablePresets[presetPath].name }}</span>
							</button>
						</div>
					</Expandable>
				</div>
			</div>
		</template>
		<template #content>
			<div class="h-[38rem] flex flex-col overflow-y-auto p-4 pt-0" :class="{ 'w-full': isMobile, 'window-content': !isMobile, 'h-full': isMobile }">
				<div v-if="selectedPreset !== null" class="flex flex-col h-full">
					<div>
						<div class="flex items-center gap-2 mb-2">
							<Icon :icon="selectedPreset.icon" />

							<span class="text-3xl font-bold font-theme select-none">{{ selectedPreset.name }}</span>
						</div>

						<p class="font-theme text-text-secondary mb-12 select-none">
							{{ selectedPreset.description }}
						</p>

						<LabeledInput
							v-if="selectedPreset.additionalModels && selectedPreset.additionalModels.PRESET_PATH !== undefined"
							:label="t('Folders')"
							class="mb-6 flex-1 bg-background"
							v-slot="{ focus, blur }"
						>
							<input
								class="bg-background outline-none placeholder:text-text-secondary max-w-none w-full font-theme"
								@focus="focus"
								@blur="blur"
								:placeholder="t('Folders')"
								:value="createPresetOptions.PRESET_PATH"
								@input="
									(event: Event) =>
										createPresetOptions.PRESET_PATH = (<HTMLInputElement>event.target).value
								"
							/>
						</LabeledInput>

						<div v-for="[fieldName, fieldId, fieldOptions] of selectedPreset.fields" :key="fieldId">
							<LabeledInput v-if="!fieldOptions || !fieldOptions.type" :label="fieldName" class="mb-6 flex-1 bg-background" v-slot="{ focus, blur }">
								<input
									class="bg-background outline-none placeholder:text-text-secondary max-w-none w-full font-theme"
									@focus="focus"
									@blur="blur"
									:placeholder="fieldName"
									:value="createPresetOptions[fieldId] ?? ''"
									@input="
									(event: Event) =>
										(createPresetOptions[fieldId] = (<HTMLInputElement>event.target).value)
								"
								/>
							</LabeledInput>

							<LabeledInput v-if="fieldOptions && fieldOptions.type === 'fileInput'" :label="fieldName" class="mb-6 flex bg-background" v-slot="{ focus, blur }">
								<input type="file" class="hidden" />

								<button class="flex align-center gap-2 text-text-secondary font-theme placeholder:text-text-secondary" @mouseenter="focus" @mouseleave="blur">
									<Icon icon="image" class="no-fill" color="text-text-secondary" />
									{{ fieldName }}
								</button>
							</LabeledInput>

							<div v-if="fieldOptions && fieldOptions.type === 'switch'" class="mb-6 flex gap-4 items-center">
								<Switch
									:model-value="createPresetOptions[fieldId]"
									@update:modelValue="
									(value: boolean) =>
										(createPresetOptions[fieldId] = value)"
								/>

								<p class="font-theme text-text-secondary">{{ fieldName }}</p>
							</div>

							<Dropdown v-if="fieldOptions && fieldOptions.type === 'selectInput' && typeof fieldOptions.options[0] === 'object'" class="mb-6 flex-1">
								<template #main="{ expanded, toggle }">
									<LabeledInput :label="t(fieldName)" :focused="expanded" class="bg-background">
										<div class="flex items-center justify-between cursor-pointer" @click="toggle">
											<span class="font-theme">{{ fieldOptions.options.find((option: any) => option.value === createPresetOptions[fieldId]).text }}</span>

											<Icon icon="arrow_drop_down" class="transition-transform duration-200 ease-out" :class="{ '-rotate-180': expanded }" />
										</div>
									</LabeledInput>
								</template>

								<template #choices="{ collapse }">
									<div class="mb-4 bg-background-secondary w-full p-1 rounded">
										<div class="flex flex-col max-h-[12rem] overflow-y-auto p-1">
											<button
												v-for="dropdownItem in fieldOptions.options"
												@click="
													() => {
														createPresetOptions[fieldId] = dropdownItem.value
														collapse()
													}
												"
												class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-theme"
												:class="{
													'bg-background-secondary': createPresetOptions[fieldId] === dropdownItem.value,
												}"
											>
												{{ dropdownItem.text }}
											</button>
										</div>
									</div>
								</template>
							</Dropdown>

							<Dropdown v-if="fieldOptions && fieldOptions.type === 'selectInput' && typeof fieldOptions.options[0] === 'string'" class="mb-6 flex-1">
								<template #main="{ expanded, toggle }">
									<LabeledInput :label="t(fieldName)" :focused="expanded" class="bg-background">
										<div class="flex items-center justify-between cursor-pointer" @click="toggle">
											<span class="font-theme">{{ createPresetOptions[fieldId] }}</span>

											<Icon icon="arrow_drop_down" class="transition-transform duration-200 ease-out" :class="{ '-rotate-180': expanded }" />
										</div>
									</LabeledInput>
								</template>

								<template #choices="{ collapse }">
									<div class="mb-4 bg-background-secondary w-full p-1 rounded">
										<div class="flex flex-col max-h-[12rem] overflow-y-auto p-1">
											<button
												v-for="dropdownItem in fieldOptions.options"
												@click="
													() => {
														createPresetOptions[fieldId] = dropdownItem
														collapse()
													}
												"
												class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-theme"
												:class="{
													'bg-background-secondary': createPresetOptions[fieldId] === dropdownItem,
												}"
											>
												{{ dropdownItem }}
											</button>
										</div>
									</div>
								</template>
							</Dropdown>
						</div>
					</div>

					<div class="flex-1 flex flex-col justify-end">
						<Button :text="t('Create')" class="self-end" @click="create" />
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>

<style scoped>
.window-content {
	width: calc(90vw - 24rem);
	max-width: 50rem;
}
</style>
