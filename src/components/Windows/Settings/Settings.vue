<template>
	<SidebarWindow
		:name="`${t('windows.settings.title')} - ${settingsManager.selectedCategory.value?.name ?? ''}`"
		id="settings"
	>
		<template #sidebar>
			<div class="p-4">
				<LabeledInput v-slot="{ focus, blur }" :label="t('Search Settings')" class="bg-menuAlternate !mt-1">
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-inter" />
					</div>
				</LabeledInput>

				<div class="mt-4" v-if="settingsManager.selectedCategory.value">
					<button
						v-for="category in settingsManager.categories"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-text rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-primary': settingsManager.selectedCategory.value.id === category.id,
						}"
						@click="settingsManager.selectedCategory.value = category"
					>
						<Icon
							:icon="category.icon"
							:color="settingsManager.selectedCategory.value.id === category.id ? 'text' : 'primary'"
							class="text-base"
						/>
						<span class="font-inter">{{ t(category.name) }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0">
				<div
					v-if="settingsManager.selectedCategory.value"
					v-for="item in settingsManager.selectedCategory.value.items"
					class="flex gap-6 items-center"
				>
					<component v-if="item.type === 'custom'" :is="item.component!" :item="item" />

					<Dropdown v-if="item.type === 'dropdown'" class="mb-4 w-48">
						<template #main="{ expanded, toggle }">
							<LabeledInput :label="t(item.name)" :focused="expanded" class="bg-background">
								<div class="flex items-center justify-between cursor-pointer" @click="toggle">
									<span class="font-inter">{{ settings[item.id] }}</span>

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
												settingsManager.set(item.id, dropdownItem)
												collapse()
											}
										"
										class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-inter"
										:class="{
											'bg-menu': settings[item.id] === dropdownItem,
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
						:model-value="settings[item.id]"
						@update:model-value="(value) => settingsManager.set(item.id, value)"
					/>

					<Button v-if="item.type === 'button'" @click="item.trigger" :text="item.text" />

					<p v-if="item.type !== 'custom'" class="text-textAlternate">
						{{ t(item.description) }}
					</p>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>

<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import Dropdown from '@/components/Common/Dropdown.vue'
import Switch from '@/components/Common/Switch.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { useSettings } from './Settings'
import { settings as settingsManager } from '@/App'

const t = useTranslate()

const settings = useSettings()
</script>
