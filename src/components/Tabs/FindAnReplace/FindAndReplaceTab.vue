<script setup lang="ts">
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'

import { type FindAndReplaceTab } from './FindAndReplaceTab'
import { ref } from 'vue'
import { useTranslate } from '@/libs/locales/Locales'
import Button from '@/components/Common/Button.vue'

const t = useTranslate()

const { instance }: { instance: FindAndReplaceTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const search = ref('')
const replace = ref('')
</script>

<template>
	<div class="w-full h-full flex">
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

			<Button :text="t('Replace')" class="mt-3" />
		</div>

		<div class="mt-2"></div>
	</div>
</template>
