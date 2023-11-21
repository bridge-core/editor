<template>
	<SidebarWindow :name="`Settings - ${selectedCategory.name}`" id="settings">
		<template #sidebar>
			<div class="p-4">
				<LabeledInput
					v-slot="{ focus, blur }"
					label="Search Settings"
					class="bg-menuAlternate !mt-1"
				>
					<div class="flex gap-1">
						<Icon
							icon="search"
							class="transition-colors duration-100 ease-out"
						/>
						<input
							@focus="focus"
							@blur="blur"
							class="outline-none border-none bg-transparent"
						/>
					</div>
				</LabeledInput>

				<div class="mt-4">
					<button
						v-for="category in instance.categories"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-text rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-primary': selectedCategory.id === category.id,
						}"
						@click="selectedCategory = category"
					>
						<Icon
							:icon="category.icon"
							:color="
								selectedCategory.id === category.id
									? 'text'
									: 'primary'
							"
							class="text-base"
						/>
						<span>{{ category.name }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content> <div class="w-[64rem] h-[38rem]"></div> </template>
	</SidebarWindow>
</template>

<script setup lang="ts">
import SidebarWindow from '/@/components/Windows/SidebarWindow.vue'
import LabeledInput from '/@/components/Common/LabeledInput.vue'
import Icon from '/@/components/Common/Icon.vue'

import { ref } from 'vue'
import { App } from '/@/App'
import { translate as t } from '/@/libs/locales/Locales'

const instance = App.instance.settings

const selectedCategory = ref(instance.categories[0])
</script>
