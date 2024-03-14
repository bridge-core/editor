<script setup lang="ts">
import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'

const t = useTranslate()
const get = Settings.useGet()

defineProps(['item'])
</script>

<template>
	<div class="flex gap-6 items-center mb-4">
		<div>
			<button
				@click="Settings.set('colorScheme', 'auto')"
				class="px-2 py-1 font-inter rounded-l border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('colorScheme') === 'auto',
					'bg-background-secondary': get('colorScheme') !== 'auto',
				}"
			>
				{{ t('Auto') }}
			</button>

			<button
				@click="Settings.set('colorScheme', 'dark')"
				class="px-2 py-1 font-inter border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('colorScheme') === 'dark',
					'bg-background-secondary': get('colorScheme') !== 'dark',
				}"
			>
				{{ t('Dark') }}
			</button>

			<button
				@click="Settings.set('colorScheme', 'light')"
				class="px-2 py-1 font-inter rounded-r border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('colorScheme') === 'light',
					'bg-background-secondary': get('colorScheme') !== 'light',
				}"
			>
				{{ t('Light') }}
			</button>
		</div>

		<p class="text-text-secondary mr-6">
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
