<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'
import Error from '@/components/Common/Error.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Windows } from '../Windows'
import { ReportErrorWindow } from './ReportErrorWindow'
import { openUrl } from '@/libs/OpenUrl'

const t = useTranslate()

const { window } = defineProps<{ window: ReportErrorWindow }>()

function discord() {
	navigator.clipboard.writeText(window.message)

	openUrl('https://discord.gg/jj2PmqU')
}

function report() {
	openUrl(`https://github.com/bridge-core/editor/issues/new?assignees=&labels=bug&template=bug_report.md&title=${window.message}`)
}

function copy() {
	navigator.clipboard.writeText(window.message)

	Windows.close(window)
}
</script>

<template>
	<Window :name="t('windows.reportError.title')" @close="Windows.close(window)">
		<div class="p-4 pt-0 block w-screen max-w-sm">
			<p class="font-theme mb-6">{{ t('windows.reportError.explanation') }}</p>

			<Error :text="window.message" class="w-full mb-6" />

			<div class="flex justify-end gap-2">
				<Button icon="flag" :text="t('windows.reportError.discord')" @click="discord" />
				<Button icon="report" :text="t('windows.reportError.github')" @click="report" />
				<Button icon="content_copy" :text="t('windows.reportError.copy')" @click="copy" />
			</div>
		</div>
	</Window>
</template>
