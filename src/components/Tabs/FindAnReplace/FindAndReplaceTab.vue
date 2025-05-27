<script setup lang="ts">
import LabeledInput from '@/components/Common/LabeledInput.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'

import { type FindAndReplaceTab } from './FindAndReplaceTab'
import { ref, watch } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import { TabManager } from '@/components/TabSystem/TabManager'

const t = useTranslate()

const { instance }: { instance: FindAndReplaceTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

watch(instance.searchValue, startSearch)
watch(instance.replaceValue, startSearch)
watch(instance.matchWord, startSearch)
watch(instance.matchCase, startSearch)
watch(instance.useRegex, startSearch)

function startSearch() {
	instance.startSearch(instance.searchValue.value, instance.matchCase.value, instance.useRegex.value)
}
</script>

<template>
	<div class="w-full h-full flex gap-4 items-stretch">
		<div>
			<LabeledTextInput label="findAndReplace.search" v-model="instance.searchValue.value" icon="search" class="!mt-1" />

			<LabeledTextInput
				label="findAndReplace.replace"
				v-model="instance.replaceValue.value"
				icon="content_paste_search"
				class="mt-4"
			/>

			<div class="flex mt-3">
				<Button :text="t('findAndReplace.replace')" @click="() => instance.replace(instance.replaceValue.value)" />

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': instance.matchWord.value,
						'bg-background-secondary': !instance.matchWord.value,
					}"
					@click="instance.matchWord.value = !instance.matchWord.value"
				>
					<span class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>text_format</span
					>
				</button>

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': instance.matchCase.value,
						'bg-background-secondary': !instance.matchCase.value,
					}"
					@click="instance.matchCase.value = !instance.matchCase.value"
				>
					<span class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>match_case</span
					>
				</button>

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': instance.useRegex.value,
						'bg-background-secondary': !instance.useRegex.value,
					}"
					@click="instance.useRegex.value = !instance.useRegex.value"
				>
					<span class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>asterisk</span
					>
				</button>
			</div>
		</div>

		<div class="mt-2 h-full flex-1 overflow-auto box-border">
			<div v-for="path of Object.keys(instance.queryResult.value)">
				<div class="flex items-center gap-2 cursor-pointer" @click="TabManager.openFile(path)">
					<Icon
						:icon="instance.queryResult.value[path].icon"
						class="text-[var(--color)]"
						:style="{
							'--color': `var(--theme-color-${instance.queryResult.value[path].color})`,
						}"
					/>

					<p class="text-lg font-bold">{{ instance.queryResult.value[path].prettyPath }}</p>
				</div>

				<div v-for="result of instance.queryResult.value[path].results" class="cursor-pointer" @click="TabManager.openFile(path)">
					<span class="text-text-secondary">{{ result.previousContext ?? '' }}</span>

					<span
						v-if="instance.replaceValue.value === '' || instance.replaceValue.value === instance.searchValue.value"
						class="text-primary font-bold"
						>{{ result.value }}</span
					>

					<span v-else>
						<span class="text-text-secondary line-through">{{ result.value }}</span>

						<span class="text-primary font-bold">{{ instance.replaceValue.value }}</span>
					</span>

					<span class="text-text-secondary">{{ result.nextContext ?? '' }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
