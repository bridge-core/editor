<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import type { AlertWindow } from './AlertWindow'
import { Windows } from '../Windows'

const t = useTranslate()

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: AlertWindow }
</script>

<template>
	<Window :name="t('windows.alert.name')" @close="Windows.close(window)">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-inter">
				{{ t(window.text) }}
			</p>

			<div class="flex justify-end gap-2">
				<Button :text="t('Ok')" class="font-inter" @click="Windows.close(window)" />
			</div>
		</div>
	</Window>
</template>
