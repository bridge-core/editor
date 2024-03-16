<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'

const t = useTranslate()

const window: Ref<Window | null> = ref(null)

function confirm() {
	if (!window.value) return

	ConfirmWindow.confirm()

	window.value.close()
}

function cancel() {
	if (!window.value) return

	ConfirmWindow.cancel()

	window.value.close()
}
</script>

<template>
	<Window :name="t('general.confirm')" id="confirm" ref="window">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-inter">
				{{ t(ConfirmWindow.text) }}
			</p>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-inter" @click="confirm" />
				<Button :text="t('Cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
