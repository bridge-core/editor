<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import Icon from '@/components/Common/Icon.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ref } from 'vue'

const t = useTranslate()

const categories: {
	name: string
	id: string
	icon: string
}[] = [
	{
		name: 'General',
		id: 'general',
		icon: 'settings',
	},
	{
		name: 'Profiles',
		id: 'profiles',
		icon: 'group',
	},
	{
		name: 'Output Folders',
		id: 'outputFolders',
		icon: 'folder',
	},
	{
		name: 'Logs',
		id: 'logs',
		icon: 'contract',
	},
]

const selectedCategory = ref(categories[0].id)
</script>

<template>
	<SidebarWindow :name="t('Compiler')" id="compiler" ref="window">
		<template #sidebar>
			<div class="p-4">
				<div class="overflow-y-scroll max-h-[34rem]">
					<button
						v-for="category of categories"
						class="w-full flex align-center gap-2 border-transparent hover:border-text border-2 transition-colors duration-100 ease-out rounded p-2 mt-1"
						:class="{
							'bg-primary': selectedCategory === category.id,
						}"
						@click="selectedCategory = category.id"
					>
						<Icon
							:icon="category.icon"
							class="text-base transition-colors duration-100 ease-out"
							:class="{
								'text-text': selectedCategory === category.id,
								'text-primary':
									selectedCategory !== category.id,
							}"
						/>
						<span class="font-inter select-none">{{
							t(category.name)
						}}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div
				class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0"
			>
				<div v-if="selectedCategory === 'outputFolders'">
					<p>Output Folders</p>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
