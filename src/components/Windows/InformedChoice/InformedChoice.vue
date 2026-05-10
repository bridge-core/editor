<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'

import { useTranslate } from '@/libs/locales/Locales'
import type { InformedChoiceWindow } from './InformedChoiceWindow'
import { Windows } from '../Windows'
import Icon from '@/components/Common/Icon.vue'

const t = useTranslate()

const { window } = defineProps<{ window: InformedChoiceWindow }>()

function cancel() {
	window.cancel()

	Windows.close(window)
}
</script>

<template>
	<Window :name="t(window.name)" @close="cancel">
		<div class="p-4 pb-1 pt-0">
			<p class="mb-4 max-w-sm font-theme flex flex-col gap-4">
				<div v-for="choice in window.choices" class="bg-background-secondary p-4 rounded border-background hover:border-accent border-2 transition-colors duration-100 ease-out group cursor-pointer" @click="() => {
					choice.choose()

					Windows.close(window)
				}">
					<span class="flex gap-2 items-center mb-1">
						<Icon :icon="choice.icon" class="text-primary"/>

						<h1 class="font-theme font-bold text-lg">{{ t(choice.name) }}</h1>
					</span>

					<p class="font-theme">{{ t(choice.description) }}</p>
				</div>
			</p>
		</div>
	</Window>
</template>
