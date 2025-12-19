<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import LabeledDropdown from '@/components/Common/LabeledDropdown.vue'
import Switch from '@/components/Common/Switch.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import LabeledAutocompleteInput from '@/components/Common/LabeledAutocompleteInput.vue'

import { computed, ref, watch } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'
import { SettingsWindow } from './SettingsWindow'
import { Windows } from '@/components/Windows/Windows'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()

const get = Settings.useGet()

const search = ref('')

const filteredCategories = computed(() => {
	if (search.value === '') return SettingsWindow.categories

	return Object.fromEntries(
		Object.entries(SettingsWindow.categories).filter(([id, category]) => {
			return (
				id.toLowerCase().includes(search.value.toLowerCase()) ||
				t.value(category.label).toLowerCase().includes(search.value.toLowerCase()) ||
				Object.entries(SettingsWindow.items[id]).some(([id, item]) => {
					if (id.toLowerCase().includes(search.value.toLowerCase())) return true

					if (item.label && t.value(item.label).toLowerCase().includes(search.value.toLowerCase())) return true

					return false
				})
			)
		})
	)
})

watch(filteredCategories, () => {
	if (filteredCategories.value[SettingsWindow.selectedCategory.value]) return

	if (Object.keys(filteredCategories.value).length === 0) return

	SettingsWindow.selectedCategory.value = Object.keys(filteredCategories.value)[0]
})

SettingsWindow.setup()

const isMobile = useIsMobile()
</script>

<template>
	<SidebarWindow
		:name="`${t('windows.settings.title')} - ${t(
			SettingsWindow.selectedCategory.value ? SettingsWindow.categories[SettingsWindow.selectedCategory.value].label : ''
		)}`"
		@close="Windows.close(SettingsWindow)"
	>
		<template #sidebar="{ hide }">
			<div class="p-4">
				<LabeledInput
					v-slot="{ focus, blur }"
					:label="t('windows.settings.searchSettings')"
					class="bg-background-secondary !mt-1 border-background-tertiary"
				>
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-theme" v-model="search" />
					</div>
				</LabeledInput>

				<div class="mt-4">
					<button
						v-for="[id, category] in Object.entries(filteredCategories)"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-accent rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-primary': SettingsWindow.selectedCategory.value === id,
						}"
						@click="
							() => {
								SettingsWindow.selectedCategory.value = id
								hide()
							}
						"
					>
						<Icon
							:icon="category.icon"
							:color="SettingsWindow.selectedCategory.value === id ? 'accent' : 'primary'"
							class="text-base"
						/>
						<span
							class="font-theme"
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
			<div
				class="max-w-[64rem] w-[50vw] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0"
				:class="{ 'w-full': isMobile, 'h-full': isMobile }"
			>
				<div
					v-if="SettingsWindow.selectedCategory.value !== null"
					v-for="[id, item] in Object.entries(SettingsWindow.items[SettingsWindow.selectedCategory.value])"
					class="flex gap-6 items-center"
				>
					<div v-if="item.type === 'custom'" class="w-full">
						<h2 v-if="item.label" class="mb-2 text-text font-theme">
							{{ t(item.label) }}
						</h2>
						<component :is="item.component" :item="item" />
					</div>

					<div v-if="item.type === 'dropdown'" class="flex flex-1">
						<div class="flex flex-1">
							<LabeledDropdown
								class="mt-2 mb-4 max-w-96 flex-1"
								:label="item.label"
								:options="item.labels.value"
								:model-value="item.labels.value[item.values.value.indexOf(get(id))]"
								@submit="(value) => Settings.set(id, item.values.value[item.labels.value.indexOf(value)])"
							/>

							<p class="text-text-secondary ml-4 self-center max-w-96">{{ t(item.description) }}</p>
						</div>
					</div>

					<div v-if="item.type === 'toggle'" class="mt-2 mb-4">
						<h2 class="mb-2 text-text font-theme">{{ t(item.label) }}</h2>

						<div class="flex">
							<Switch :model-value="get(id)" @update:model-value="(value) => Settings.set(id, value)" />

							<p class="text-text-secondary ml-4">{{ t(item.description) }}</p>
						</div>
					</div>

					<div v-if="item.type === 'autocomplete'" class="flex flex-1">
						<div class="flex flex-1">
							<LabeledAutocompleteInput
								class="mt-2 mb-4 max-w-96 flex-1"
								:completions="item.completions.value"
								:label="item.label"
								:model-value="get(id).toString()"
								@update:model-value="(value: string | undefined) => Settings.set(id, value)"
							/>

							<p class="text-text-secondary ml-4 self-center max-w-96">{{ t(item.description) }}</p>
						</div>
					</div>

					<div v-if="item.type === 'text'" class="flex flex-1">
						<div class="flex flex-1">
							<LabeledTextInput
								class="mt-2 mb-4 max-w-96 flex-1"
								:label="item.label"
								:model-value="get(id).toString()"
								@update:model-value="(value: string | undefined) => Settings.set(id, value)"
							/>

							<p class="text-text-secondary ml-4 self-center max-w-96">{{ t(item.description) }}</p>
						</div>
					</div>

					<div v-if="item.type === 'tab'">
						<h2 class="mb-2 text-text font-theme">{{ t(item.label) }}</h2>

						<div class="flex gap-6 items-center mb-4">
							<div class="min-w-max">
								<button
									v-for="(option, index) in item.labels"
									@click="Settings.set(id, item.values[index])"
									class="px-2 py-1 font-theme border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
									:class="{
										'bg-primary': get(id) === item.values[index],
										'bg-background-secondary': get(id) !== item.values[index],
										'rounded-l': index === 0,
										'rounded-r': index === item.labels.length - 1,
									}"
								>
									{{ t(item.labels[index]) }}
								</button>
							</div>

							<p class="text-text-secondary mr-6">
								{{ t(item.description) }}
							</p>
						</div>
					</div>

					<div v-if="item.type === 'label'" class="mt-4">
						<h2 class="font-theme text-xl font-bold">{{ t(item.label) }}</h2>
					</div>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
