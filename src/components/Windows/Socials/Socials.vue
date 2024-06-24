<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { SocialsWindow } from './SocialsWindow'
import { Windows } from '../Windows'

const t = useTranslate()

function openDiscord() {
	window.open('https://discord.gg/jj2PmqU')
}

function openTwitter() {
	//Should be X but I hate that name.
	window.open('https://twitter.com/bridgeIDE')
}

function openGithub() {
	window.open('https://github.com/bridge-core')
}
</script>

<template>
	<Window :name="t('windows.socials.title')" @close="Windows.close(SocialsWindow)">
		<div class="mx-4 mb-4">
			<p>{{ t('windows.socials.content') }}</p>
			<div class="flex flex-row mt-5 gap-2">
				<Button :text="t('windows.socials.discord')" @click="openDiscord" />
				<Button :text="t('windows.socials.twitter')" @click="openTwitter" />
				<Button :text="t('windows.socials.github')" @click="openGithub" />
			</div>
		</div>
	</Window>
</template>
