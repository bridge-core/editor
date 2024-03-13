<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import Dropdown from '@/components/Common/Dropdown.vue'
import Switch from '@/components/Common/Switch.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Settings, useSettings } from '@/libs/settings/Settings'
import { selectedCategory } from './SettingsWindow'
import { computed, ref } from 'vue'

const t = useTranslate()

const settings = useSettings()

const search = ref('')

const definitions = Object.values(Settings.definitions).map((definition) => definition.category)
const categories = ref(definitions.filter((definition, index) => definitions.indexOf(definition) === index))
</script>

<template>
	<SidebarWindow :name="`${t('windows.settings.title')} - ${t(selectedCategory ?? 'No Category')}`" id="settings">
		<template #sidebar>
			<div class="p-4">
				<LabeledInput
					v-slot="{ focus, blur }"
					:label="t('windows.settings.searchSettings')"
					class="bg-menuAlternate !mt-1"
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

				<!-- <div class="mt-4" v-if="selectedCategory">
					<button
						v-for="category in categories"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-accent rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-primary': selectedCategory === category,
						}"
						@click="selectedCategory = category"
					>
						<Icon
							:icon="category.icon"
							:color="settings.selectedCategory.value.id === category.id ? 'accent' : 'primary'"
							class="text-base"
						/>
						<span
							class="font-inter"
							:class="{
								'text-accent': settings.selectedCategory.value.id === category.id,
								'text-text': settings.selectedCategory.value.id !== category.id,
							}"
							>{{ t(category.name) }}</span
						>
					</button>
				</div> -->
			</div>
		</template>

		<template #content>
			<div class="max-w-[64rem] w-[50vw] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0">
				<!-- <div
					v-for="[id, definition] in Object.entries(Settings.definitions)"
					class="flex gap-6 items-center"
				>
					<component v-if="item.type === 'custom'" :is="item.component!" :item="item" />

					<Dropdown v-if="item.type === 'dropdown'" class="mb-4 flex-1">
						<template #main="{ expanded, toggle }">
							<LabeledInput :label="t(item.name)" :focused="expanded" class="bg-background">
								<div class="flex items-center justify-between cursor-pointer" @click="toggle">
									<span class="font-inter">{{ settings.get(item.id) }}</span>

									<Icon
										icon="arrow_drop_down"
										class="transition-transform duration-200 ease-out"
										:class="{ '-rotate-180': expanded }"
									/>
								</div>
							</LabeledInput>
						</template>

						<template #choices="{ collapse }">
							<div class="mt-2 bg-menuAlternate w-full p-1 rounded">
								<div class="flex flex-col max-h-[12rem] overflow-y-auto p-1">
									<button
										v-for="dropdownItem in item.items"
										@click="
											() => {
												settings.set(item.id, dropdownItem)
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-inter"
										:class="{
											'bg-menu': settings.get(item.id) === dropdownItem,
										}"
									>
										{{ dropdownItem }}
									</button>
								</div>
							</div>
						</template>
					</Dropdown>

					<Switch
						v-if="item.type === 'switch'"
						:model-value="settings.get(item.id)"
						@update:model-value="(value) => settings.set(item.id, value)"
					/>

					<Button v-if="item.type === 'button'" @click="item.trigger" :text="t(item.text)" />

					<p v-if="item.type !== 'custom'" class="text-textAlternate mr-6">
						{{ t(item.description) }}
					</p>
				</div> -->
			</div>
		</template>
	</SidebarWindow>
</template>
