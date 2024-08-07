<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import Dropdown from '@/components/Common/LegacyDropdown.vue'
import Switch from '@/components/Common/Switch.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'
import { AutocompleteItem, CustomItem, DropdownItem, SettingsWindow, ToggleItem } from './SettingsWindow'
import { ref } from 'vue'
import { Windows } from '../Windows'
import LabeledAutocompleteInput from '@/components/Common/LabeledAutocompleteInput.vue'

const t = useTranslate()

const get = Settings.useGet()

const search = ref('')

SettingsWindow.setup()
</script>

<template>
	<SidebarWindow
		:name="`${t('windows.settings.title')} - ${t(
			SettingsWindow.selectedCategory.value
				? SettingsWindow.categories[SettingsWindow.selectedCategory.value].label
				: ''
		)}`"
		@close="Windows.close(SettingsWindow)"
	>
		<template #sidebar>
			<div class="p-4">
				<LabeledInput
					v-slot="{ focus, blur }"
					:label="t('windows.settings.searchSettings')"
					class="bg-background-secondary !mt-1"
				>
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input
							@focus="focus"
							@blur="blur"
							class="outline-none border-none bg-transparent font-inter"
							v-model="search"
						/>
					</div>
				</LabeledInput>

				<div class="mt-4">
					<button
						v-for="[id, category] in Object.entries(SettingsWindow.categories)"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-accent rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-primary': SettingsWindow.selectedCategory.value === id,
						}"
						@click="SettingsWindow.selectedCategory.value = id"
					>
						<Icon
							:icon="category.icon"
							:color="SettingsWindow.selectedCategory.value === id ? 'accent' : 'primary'"
							class="text-base"
						/>
						<span
							class="font-inter"
							:class="{
								'text-accent': SettingsWindow.selectedCategory.value === id,
								'text-text': SettingsWindow.selectedCategory.value !== id,
							}"
							>{{ t(category.label) }}</span
						>
					</button>
				</div>
			</div>
		</template>

		<template #content>
			<div class="max-w-[64rem] w-[50vw] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0">
				<div
					v-if="SettingsWindow.selectedCategory.value !== null"
					v-for="[id, item] in Object.entries(SettingsWindow.items[SettingsWindow.selectedCategory.value])"
					class="flex gap-6 items-center"
				>
					<component v-if="item.type === 'custom'" :is="(item as CustomItem).component" :item="item" />

					<Dropdown v-if="item.type === 'dropdown'" class="mb-4 flex-1">
						<template #main="{ expanded, toggle }">
							<LabeledInput
								:label="t((item as DropdownItem).label)"
								:focused="expanded"
								class="bg-background"
							>
								<div class="flex items-center justify-between cursor-pointer" @click="toggle">
									<span class="font-inter">{{
										(item as DropdownItem).labels.value[
											(item as DropdownItem).values.value.indexOf(get(id))
										]
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
							<div class="mt-2 bg-background-secondary w-full p-1 rounded">
								<div class="flex flex-col max-h-[12rem] overflow-y-auto p-1">
									<button
										v-for="value in (item as DropdownItem).values.value"
										@click="
											() => {
												Settings.set(id, value)
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-inter"
										:class="{
											'bg-background-tertiary': get(id) === value,
										}"
									>
										{{
											(item as DropdownItem).labels.value[
												(item as DropdownItem).values.value.indexOf(value)
											]
										}}
									</button>
								</div>
							</div>
						</template>
					</Dropdown>

					<div v-if="item.type === 'toggle'">
						<h2 class="mb-2 text-text font-inter">{{ t((item as ToggleItem).label) }}</h2>

						<Switch :model-value="get(id)" @update:model-value="(value) => Settings.set(id, value)" />
					</div>

					<div v-if="item.type === 'autocomplete'">
						<LabeledAutocompleteInput
							:completions="(item as AutocompleteItem).completions.value"
							:label="(item as AutocompleteItem).label"
							:model-value="get(id)"
							@update:model-value="(value) => Settings.set(id, value)"
						/>
					</div>

					<!--<Button v-if="item.type === 'button'" @click="item.trigger" :text="t(item.text)" />

					<p v-if="item.type !== 'custom'" class="text-text-secondary mr-6">
						{{ t(item.description) }}
					</p> -->
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
