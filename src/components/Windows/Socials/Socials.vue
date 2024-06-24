<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { SocialsWindow } from './SocialsWindow'
import { Windows } from '../Windows'

const t = useTranslate()
</script>

<template>
	<Window :name="t('windows.socials.title')" @close="Windows.close(SocialsWindow)">
		<div class="mx-4 mb-4">
			<p>{{ t('windows.socials.content') }}</p>
			<div class="flex flex-row mt-5 gap-2">
				<Button :text="t('windows.socials.discord')" />
				<Button :text="t('windows.socials.twitter')" />
				<Button :text="t('windows.socials.github')" />
			</div>
		</div>
	</Window>
</template>
