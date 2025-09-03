<template>
	<Window :name="t('windows.changelogWindow.title')" @close="Windows.close(AboutWindow)">
		<div class="w-[80vw] max-w-2xl overflow-auto h-[42rem] p-8" :class="{ 'h-full': isMobile }">
			<p>Example Content</p>
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'

import { onMounted, ref } from 'vue'
import { appVersion, baseUrl } from '@/libs/app/AppEnv'
import { useTranslate } from '@/libs/locales/Locales'
import { Windows } from '../Windows'
import { AboutWindow } from './AboutWindow'
import { useIsMobile } from '@/libs/Mobile'
import { openUrl } from '@/libs/OpenUrl'

const t = useTranslate()

const isMobile = useIsMobile()

onMounted(() => {
	// openUrl(`https://github.com/bridge-core/editor/releases/tag/v${appVersion}`)
})
</script>
