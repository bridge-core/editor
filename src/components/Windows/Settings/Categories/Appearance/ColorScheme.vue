<script setup lang="ts">
import { useTranslate } from '@/libs/locales/Locales'
import { useSettings } from '../../Settings'
import { onMounted } from 'vue'

const t = useTranslate()
const settings = useSettings()

const { item } = defineProps(['item'])
</script>

<template>
	<div class="flex gap-6 items-center mb-4">
		<div>
			<button
				@click="settings.set('colorScheme', 'auto')"
				class="px-2 py-1 font-inter rounded-l border-transparent hover:border-text border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': settings.get('colorScheme') === 'auto',
					'bg-menu': settings.get('colorScheme') !== 'auto',
				}"
			>
				{{ t('Auto') }}
			</button>

			<button
				@click="settings.set('colorScheme', 'dark')"
				class="px-2 py-1 font-inter border-transparent hover:border-text border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': settings.get('colorScheme') === 'dark',
					'bg-menu': settings.get('colorScheme') !== 'dark',
				}"
			>
				{{ t('Dark') }}
			</button>

			<button
				@click="settings.set('colorScheme', 'light')"
				class="px-2 py-1 font-inter rounded-r border-transparent hover:border-text border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': settings.get('colorScheme') === 'light',
					'bg-menu': settings.get('colorScheme') !== 'light',
				}"
			>
				{{ t('Light') }}
			</button>
		</div>

		<p class="text-textAlternate mr-6">
			{{ t('windows.settings.appearance.colorScheme.description') }}
		</p>
	</div>
</template>

<style scoped>
.rounded-l {
	border-top-left-radius: 0.25rem;
	border-bottom-left-radius: 0.25rem;
}

.rounded-r {
	border-top-right-radius: 0.25rem;
	border-bottom-right-radius: 0.25rem;
}
</style>
