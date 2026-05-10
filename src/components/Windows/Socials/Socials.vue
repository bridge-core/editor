<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { SocialsWindow } from './SocialsWindow'
import { Windows } from '../Windows'
import { useIsMobile } from '@/libs/Mobile'
import { openUrl } from '@/libs/OpenUrl'

const t = useTranslate()
const isMobile = useIsMobile()

function openDiscord() {
	openUrl('https://discord.gg/jj2PmqU')
}

function openTwitter() {
	openUrl('https://twitter.com/bridgeIDE')
}

function openGithub() {
	openUrl('https://github.com/bridge-core')
}
</script>

<template>
	<Window :name="t('windows.socials.title')" @close="Windows.close(SocialsWindow)">
		<div class="mx-4 mb-4 h-full flex flex-col justify-between" :style="{ 'max-width': !isMobile ? '20rem' : undefined }">
			<p>{{ t('windows.socials.content') }}</p>
			<div class="flex flex-row mt-5 gap-2 ml-auto">
				<Button :text="t('windows.socials.discord')" @click="openDiscord" />
				<Button :text="t('windows.socials.twitter')" @click="openTwitter" />
				<Button :text="t('windows.socials.github')" @click="openGithub" />
			</div>
		</div>
	</Window>
</template>
