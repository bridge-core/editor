<script setup lang="ts">
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'

import { type FindAndReplaceTab } from './FindAndReplaceTab'
import { ref, watch } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import Button from '@/components/Common/Button.vue'
import IconButton from '@/components/Common/IconButton.vue'
import { tabManager } from '@/App'

const t = useTranslate()

const { instance }: { instance: FindAndReplaceTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const search = ref('')
const replace = ref('')
const matchWord = ref(false)
const matchCase = ref(false)
const useRegex = ref(false)

watch(search, startSearch)
watch(replace, startSearch)
watch(matchWord, startSearch)
watch(matchCase, startSearch)
watch(useRegex, startSearch)

function startSearch() {
	instance.startSearch(search.value, matchCase.value, useRegex.value)
}
</script>

<template>
	<div class="w-full h-full flex gap-4 items-stretch">
		<div class="mt-2">
			<LabeledInput v-slot="{ focus, blur }" :label="t('Search')" class="bg-background !mt-1">
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

			<LabeledInput v-slot="{ focus, blur }" :label="t('Replace')" class="bg-background !mt-4">
				<div class="flex gap-1">
					<Icon icon="content_paste_search" class="transition-colors duration-100 ease-out" />

					<input
						@focus="focus"
						@blur="blur"
						class="outline-none border-none bg-transparent font-inter"
						v-model="replace"
					/>
				</div>
			</LabeledInput>

			<div class="flex mt-3">
				<Button :text="t('Replace')" @click="() => instance.replace(replace)" />

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': matchWord,
						'bg-menu': !matchWord,
					}"
					@click="matchWord = !matchWord"
				>
					<span
						class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>text_format</span
					>
				</button>

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': matchCase,
						'bg-menu': !matchCase,
					}"
					@click="matchCase = !matchCase"
				>
					<span
						class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>match_case</span
					>
				</button>

				<button
					class="p-1 rounded transition-colors duration-100 ease-out select-none group hover:bg-text flex items-center ml-2"
					:class="{
						'bg-primary': useRegex,
						'bg-menu': !useRegex,
					}"
					@click="useRegex = !useRegex"
				>
					<span
						class="material-symbols-rounded group-hover:text-background transition-colors duration-100 ease-out"
						>asterisk</span
					>
				</button>
			</div>
		</div>

		<div class="mt-2 h-full flex-1 overflow-auto box-border">
			<div v-for="path of Object.keys(instance.queryResult.value)">
				<div class="flex items-center gap-2 cursor-pointer" @click="tabManager.openFile(path)">
					<Icon
						:icon="instance.queryResult.value[path].icon"
						class="text-[var(--color)]"
						:style="{
							'--color': `var(--theme-color-${instance.queryResult.value[path].color})`,
						}"
					/>

					<p class="text-lg font-bold">{{ instance.queryResult.value[path].prettyPath }}</p>
				</div>

				<div
					v-for="result of instance.queryResult.value[path].results"
					class="cursor-pointer"
					@click="tabManager.openFile(path)"
				>
					<span class="text-textAlternate">{{ result.previousContext ?? '' }}</span>

					<span v-if="replace === '' || replace === search" class="text-primary font-bold">{{
						result.value
					}}</span>

					<span v-else>
						<span class="text-textAlternate line-through">{{ result.value }}</span>

						<span class="text-primary font-bold">{{ replace }}</span>
					</span>

					<span class="text-textAlternate">{{ result.nextContext ?? '' }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
