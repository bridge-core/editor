<script setup lang="ts">
import SidebarWindow from '../SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'

import { extensionLibrary, extensions } from '@/App'
import { useTranslate } from '@/libs/locales/Locales'
import Button from '@/components/Common/Button.vue'

const t = useTranslate()
</script>

<template>
	<SidebarWindow :name="t('windows.extensionLibrary.title')" id="extensionLibrary">
		<template #sidebar>
			<div class="p-4">
				<LabeledInput v-slot="{ focus, blur }" :label="t('Search Extensions')" class="bg-menuAlternate !mt-1">
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-inter" />
					</div>
				</LabeledInput>

				<div class="mt-4">
					<button
						v-for="tag in Object.keys(extensionLibrary.tags)"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-text rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-[var(--color)]': extensionLibrary.selectedTag.value === tag,
						}"
						:style="{
							'--color': `var(--theme-color-${extensionLibrary.tags[tag].color ?? 'primary'})`,
						}"
						@click="extensionLibrary.selectedTag.value = tag"
					>
						<Icon
							:icon="extensionLibrary.tags[tag].icon"
							:color="
								extensionLibrary.selectedTag.value === tag
									? 'text'
									: extensionLibrary.tags[tag].color ?? 'primary'
							"
							class="text-base"
						/>
						<span class="font-inter">{{ t(tag) }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0 mr-2">
				<div
					v-for="extension in extensionLibrary.extensions.filter(
						(extension) =>
							extensionLibrary.selectedTag.value === 'All' ||
							extension.tags.includes(extensionLibrary.selectedTag.value)
					)"
					:key="extension.id"
					class="bg-menuAlternate rounded mb-4 p-2"
				>
					<div class="flex justify-between mb-4">
						<div class="flex gap-2">
							<Icon :icon="'data_object'" color="primary" />
							<h1 class="font-inter font-bold">{{ extension.name }}</h1>
						</div>

						<div class="flex gap-2 items-center">
							<span class="material-symbols-rounded text-base">share</span>

							<Button
								icon="vertical_align_bottom"
								:text="t('Download')"
								@click="extensionLibrary.requestInstall(extension)"
							/>
						</div>
					</div>

					<div class="mb-4 flex gap-4">
						<span
							class="font-inter text-sm py-1 px-2 bg-primary hover:bg-text rounded-full flex items-center gap-1 group hover:text-background transition-colors duration-100 ease-out cursor-pointer"
						>
							<span
								class="material-symbols-rounded text-sm group-hover:text-background transition-colors duration-100 ease-out"
								>person</span
							>

							{{ extension.author }}
						</span>

						<span class="font-inter text-sm py-1 px-2 bg-menuAlternate2 rounded-full">
							{{ extension.version }}
						</span>

						<span
							v-for="tag in extension.tags"
							class="font-inter text-sm py-1 px-2 bg-[var(--color)] hover:bg-text rounded-full flex items-center gap-1 group hover:text-background transition-colors duration-100 ease-out cursor-pointer"
							:style="{
								'--color': `var(--theme-color-${extensionLibrary.tags[tag].color ?? 'primary'})`,
							}"
						>
							<span
								class="material-symbols-rounded text-sm group-hover:text-background transition-colors duration-100 ease-out"
								>{{ extensionLibrary.tags[tag].icon }}</span
							>

							{{ tag }}
						</span>
					</div>

					<p class="font-inter text-textAlternate">{{ extension.description }}</p>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
