<script setup lang="ts">
import SidebarWindow from '@/components/Windows/SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Expandable from '@/components/Common/Expandable.vue'
import Icon from '@/components/Common/Icon.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { presetsWindow } from '@/App'

const t = useTranslate()
</script>

<template>
	<SidebarWindow :name="t('Presets')" id="presets">
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
							presetsWindow.presets.value
						)"
						:name="t(category)"
					>
						<div class="flex flex-col">
							<button
								v-for="preset of presetsWindow.presets.value[
									category
								]"
								class="flex align-center gap-2 group hover:bg-menu transition-colors duration-100 ease-out rounded p-2 mt-1"
							>
								<Icon
									:icon="preset.icon"
									class="text-base group-hover:text-primary transition-colors duration-100 ease-out"
								/>
								<span class="font-inter select-none">{{
									preset.name
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
			></div>
		</template>
	</SidebarWindow>
</template>
