<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Expandable from '@/components/Common/Expandable.vue'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { presetsWindow, projectManager } from '@/App'
import { ComputedRef, Ref, computed, ref, watch } from 'vue'
import { BedrockProject } from '@/libs/project/BedrockProject'

const t = useTranslate()

const selectedPresetPath: Ref<string | null> = ref(null)

watch(presetsWindow.categorizedPresets, () => {
	if (selectedPresetPath.value !== null) return

	const firstCategory = Object.keys(presetsWindow.categorizedPresets.value)[0]
	const firstPreset = Object.keys(
		presetsWindow.categorizedPresets.value[firstCategory]
	)[0]

	selectedPresetPath.value = firstPreset
})

const selectedPreset: ComputedRef<null | any> = computed(() => {
	if (selectedPresetPath.value === null) return null

	if (!projectManager.currentProject) return null

	if (!(projectManager.currentProject instanceof BedrockProject)) return null

	return projectManager.currentProject.data.presets[selectedPresetPath.value]
})

const createPresetOptions: Ref<any> = ref({})

watch(selectedPreset, () => {
	createPresetOptions.value = {}
})

const window = ref<Window | null>(null)

async function create() {
	if (!window.value) return

	if (selectedPresetPath.value === null) return

	if (!projectManager.currentProject) return

	if (!(projectManager.currentProject instanceof BedrockProject)) return

	window.value.close()

	await presetsWindow.createPreset(
		selectedPresetPath.value,
		createPresetOptions.value
	)
}
</script>

<template>
	<SidebarWindow :name="t('Presets')" id="presets" ref="window">
		<template #sidebar>
			<div class="p-4">
				<LabeledInput
					v-slot="{ focus, blur }"
					:label="t('Search Presets')"
					class="bg-menuAlternate !mt-1 mb-2"
				>
					<div class="flex gap-1">
						<Icon
							icon="search"
							class="transition-colors duration-100 ease-out"
						/>
						<input
							@focus="focus"
							@blur="blur"
							class="outline-none border-none bg-transparent font-inter"
						/>
					</div>
				</LabeledInput>

				<div class="overflow-y-scroll max-h-[34rem]">
					<Expandable
						v-for="category of Object.keys(
							presetsWindow.categorizedPresets.value
						)"
						:name="t(category)"
					>
						<div class="flex flex-col">
							<button
								v-for="presetPath of Object.keys(
									presetsWindow.categorizedPresets.value[
										category
									]
								)"
								class="flex align-center gap-2 border-transparent hover:border-text border-2 transition-colors duration-100 ease-out rounded p-2 mt-1"
								:class="{
									'bg-menu':
										selectedPresetPath === presetPath,
								}"
								@click="selectedPresetPath = presetPath"
							>
								<Icon
									:icon="
										presetsWindow.categorizedPresets.value[
											category
										][presetPath].icon
									"
									class="text-base transition-colors duration-100 ease-out"
									:class="{
										'text-primary':
											selectedPresetPath === presetPath,
									}"
								/>
								<span class="font-inter select-none">{{
									presetsWindow.categorizedPresets.value[
										category
									][presetPath].name
								}}</span>
							</button>
						</div>
					</Expandable>
				</div>
			</div>
		</template>
		<template #content>
			<div
				class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0"
			>
				<div
					v-if="selectedPreset !== null"
					class="flex flex-col h-full"
				>
					<div>
						<div class="flex items-center gap-2 mb-2">
							<Icon :icon="selectedPreset.icon" />

							<span
								class="text-3xl font-bold font-inter select-none"
								>{{ selectedPreset.name }}</span
							>
						</div>

						<p
							class="font-inter text-textAlternate mb-12 select-none"
						>
							{{ selectedPreset.description }}
						</p>

						<div
							v-for="[
								fieldName,
								fieldId,
								fieldOptions,
							] of selectedPreset.fields"
							:key="fieldId"
						>
							<LabeledInput
								v-if="!fieldOptions.type"
								:label="fieldName"
								class="mb-6 flex-1 bg-background"
								v-slot="{ focus, blur }"
							>
								<input
									class="bg-background outline-none placeholder:text-textAlternate max-w-none w-full font-inter"
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

							<LabeledInput
								v-if="fieldOptions.type === 'fileInput'"
								:label="fieldName"
								class="mb-6 flex bg-background"
								v-slot="{ focus, blur }"
							>
								<input type="file" class="hidden" />

								<button
									class="flex align-center gap-2 text-textAlternate font-inter"
									@mouseenter="focus"
									@mouseleave="blur"
								>
									<Icon
										icon="image"
										class="no-fill"
										color="text-textAlternate"
									/>
									{{ fieldName }}
								</button>
							</LabeledInput>
						</div>
					</div>

					<div class="flex-1 flex flex-col justify-end">
						<Button
							:text="t('Create')"
							class="self-end"
							@click="create"
						/>
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
