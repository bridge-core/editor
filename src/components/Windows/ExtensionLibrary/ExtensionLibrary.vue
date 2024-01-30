<script setup lang="ts">
import SidebarWindow from '../SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'

import { extensionLibrary } from '@/App'
import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()
</script>

<template>
	<SidebarWindow :name="t('windows.extensionLibrary.title')" id="extensionLibrary">
		<template #sidebar>
			<div class="p-4">
				<LabeledInput v-slot="{ focus, blur }" :label="t('Search Settings')" class="bg-menuAlternate !mt-1">
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
			<div class="w-[64rem] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0"></div>
		</template>
	</SidebarWindow>
</template>
