<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'

import { useTranslate } from '@/libs/locales/Locales'
import type { ProgressWindow } from './ProgressWindow'
import { Windows } from '../Windows'

const t = useTranslate()

const { window } = defineProps<{ window: ProgressWindow }>()
</script>

<template>
	<Window :name="t('windows.progress.title')" @close="Windows.close(window)">
		<div class="w-72">
			<div class="p-4">
				<p class="max-w-sm font-theme">
					{{ t(window.text) }}
				</p>
			</div>

			<div class="bg-background-secondary mx-4 self-stretch h-1.5 mb-4 relative rounded-full overflow-hidden">
				<div class="bg-primary absolute h-full progress-animation"></div>
			</div>
		</div>
	</Window>
</template>

<style scoped>
@keyframes progress {
	10% {
		right: 100%;
		left: 0%;
	}

	30% {
		left: 0%;
	}

	70% {
		right: 0%;
	}

	90% {
		left: 100%;
		right: 0%;
	}
}

.progress-animation {
	animation: 1.5s infinite ease-in-out progress;
}
</style>
