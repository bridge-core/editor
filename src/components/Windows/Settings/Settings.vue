<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import Dropdown from '@/components/Common/Legacy/LegacyDropdown.vue'
import Switch from '@/components/Common/Switch.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import LabeledAutocompleteInput from '@/components/Common/LabeledAutocompleteInput.vue'

import { ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'
import { SettingsWindow } from './SettingsWindow'
import { Windows } from '@/components/Windows/Windows'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()

const get = Settings.useGet()

const search = ref('')

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
						v-for="[id, category] in Object.entries(SettingsWindow.categories)"
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

					<Dropdown v-if="item.type === 'dropdown'" class="mb-4 flex-1">
						<template #main="{ expanded, toggle }">
							<LabeledInput :label="t(item.label)" :focused="expanded" class="bg-background">
								<div class="flex items-center justify-between cursor-pointer" @click="toggle">
									<span class="font-theme">{{ item.labels.value[item.values.value.indexOf(get(id))] }}</span>

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
										v-for="value in item.values.value"
										@click="
											() => {
												Settings.set(id, value)
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-theme"
										:class="{
											'bg-background-tertiary': get(id) === value,
										}"
									>
										{{ item.labels.value[item.values.value.indexOf(value)] }}
									</button>
								</div>
							</div>
						</template>
					</Dropdown>

					<div v-if="item.type === 'toggle'" class="mt-2 mb-4">
						<h2 class="mb-2 text-text font-theme">{{ t(item.label) }}</h2>

						<Switch :model-value="get(id)" @update:model-value="(value) => Settings.set(id, value)" />
					</div>

					<div v-if="item.type === 'autocomplete'">
						<LabeledAutocompleteInput
							:completions="item.completions.value"
							:label="item.label"
							:model-value="get(id).toString()"
							@update:model-value="(value: string | undefined) => Settings.set(id, value)"
						/>
					</div>

					<div v-if="item.type === 'text'" class="w-full">
						<LabeledTextInput
							:label="item.label"
							:model-value="get(id).toString()"
							@update:model-value="(value: string | undefined) => Settings.set(id, value)"
						/>
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
