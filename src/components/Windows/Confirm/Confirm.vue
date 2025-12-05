<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import type { ConfirmWindow } from './ConfirmWindow'
import { Windows } from '../Windows'

const t = useTranslate()

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: ConfirmWindow }

function confirm() {
	window.confirm()

	Windows.close(window)
}

function cancel() {
	window.cancel()

	Windows.close(window)
}
</script>

<template>
	<Window :name="t('general.confirm')" @close="() => cancel()">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-theme">
				{{ t(window.text) }}
			</p>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-theme" @click="confirm" />
				<Button :text="t('Cancel')" class="font-theme" @click="() => cancel()" />
			</div>
		</div>
	</Window>
</template>
