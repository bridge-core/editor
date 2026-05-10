<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Logo from '@/components/Common/Logo.vue'

import { onMounted, ref } from 'vue'
import { appVersion, baseUrl } from '@/libs/app/AppEnv'
import { useTranslate } from '@/libs/locales/Locales'
import { Windows } from '../Windows'
import { AboutWindow } from './AboutWindow'
import { useIsMobile } from '@/libs/Mobile'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { ActionManager, useAction } from '@/libs/actions/ActionManager'

const t = useTranslate()

const isMobile = useIsMobile()

const action = useAction('help.openChangelog')
</script>

<template>
	<Window :name="t('windows.about.title')" @close="Windows.close(AboutWindow)">
		<div class="overflow-auto p-8" :class="{ 'h-full': isMobile }">
			<div class="flex flex-col items-center mx-12">
				<Logo class="w-36 mb-8" />

				<p class="font-theme mb-2">
					bridge. v{{ appVersion }} -
					{{ tauriBuild ? 'Tauri' : 'Web' + (fileSystem instanceof PWAFileSystem ? '' : ' Compatability') }}
				</p>

				<a
					class="font-theme text-primary cursor-pointer select-none hover:underline hover:text-accent transition-colors duration-100 ease-in-out"
					@click="ActionManager.trigger('help.openChangelog')"
					>{{ t(action?.name ?? 'actions.unknown.name') }}</a
				>
			</div>
		</div>
	</Window>
</template>
