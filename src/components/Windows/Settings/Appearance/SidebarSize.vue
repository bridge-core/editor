<script setup lang="ts">
import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'

const t = useTranslate()
const get = Settings.useGet()

Settings.addSetting('sidebarSize', {
	default: 'normal',
})

defineProps(['item'])
</script>

<template>
	<div class="flex gap-6 items-center mb-4">
		<div>
			<button
				@click="Settings.set('sidebarSize', 'small')"
				class="px-2 py-1 font-theme rounded-l border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('sidebarSize') === 'small',
					'bg-background-secondary': get('sidebarSize') !== 'small',
				}"
			>
				{{ t('Small') }}
			</button>

			<button
				@click="Settings.set('sidebarSize', 'normal')"
				class="px-2 py-1 font-theme border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('sidebarSize') === 'normal',
					'bg-background-secondary': get('sidebarSize') !== 'normal',
				}"
			>
				{{ t('Normal') }}
			</button>

			<button
				@click="Settings.set('sidebarSize', 'large')"
				class="px-2 py-1 font-theme border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('sidebarSize') === 'large',
					'bg-background-secondary': get('sidebarSize') !== 'large',
				}"
			>
				{{ t('Large') }}
			</button>

			<button
				@click="Settings.set('sidebarSize', 'x-large')"
				class="px-2 py-1 font-theme rounded-r border-transparent hover:border-accent border-2 transition-colors duration-100 ease-out"
				:class="{
					'bg-primary': get('sidebarSize') === 'x-large',
					'bg-background-secondary': get('sidebarSize') !== 'x-large',
				}"
			>
				{{ t('X-Large') }}
			</button>
		</div>

		<p class="text-text-secondary mr-6">
			{{ t('windows.settings.sidebar.sidebarSize.description') }}
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
