<template>
	<div data-tauri-drag-region class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div class="flex gap-4">
			<button v-for="item in Toolbar.items" class="flex items-center gap-1 group" @click="item.action">
				<span
					class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-inter select-none"
					>{{ t(item.name) }}</span
				>
			</button>
		</div>
		<div class="flex gap-4 items-center">
			<div class="flex gap-2 items-center" @click="openChangelog">
				<Logo class="w-4" />
				<span class="text-sm text-textAlternate font-inter"> v{{ appVersion }} </span>
			</div>

			<div v-if="tauriBuild" class="flex gap-2 items-center">
				<IconButton @click="appWindow.minimize()" icon="remove" class="text-base" />
				<IconButton @click="appWindow.toggleMaximize()" icon="select_window" class="text-base" />
				<IconButton @click="appWindow.close()" icon="close" class="text-base" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { Windows } from '@/components/Windows/Windows'
import { appVersion } from '@/libs/app/AppEnv'
import { useTranslate } from '@/libs/locales/Locales'
import { appWindow } from '@tauri-apps/api/window'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { Toolbar } from './Toolbar'

const t = useTranslate()

function openChangelog() {
	Windows.open('changelog')
}
</script>
