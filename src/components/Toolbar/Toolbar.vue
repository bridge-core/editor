<template>
	<div class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div class="flex gap-4">
			<button
				v-for="item in toolbar.items"
				class="flex items-center gap-1 group"
				@click="item.action"
			>
				<span
					class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-inter select-none"
					>{{ t(item.name) }}</span
				>
			</button>
		</div>
		<div class="flex gap-2" @click="openChangelog">
			<Logo class="w-4" />
			<span class="text-sm text-textAlternate font-inter">
				v{{ version }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'

import { toolbar, windows } from '@/App'
import { version } from '@/libs/app/Version'
import { useTranslate } from '@/libs/locales/Locales'
const t = useTranslate()

function openChangelog() {
	windows.openWindows.value.push('changelog')
}
</script>
