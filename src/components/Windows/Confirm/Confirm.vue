<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'
import type { ConfirmWindow } from './ConfirmWindow'

const t = useTranslate()

const windowElement: Ref<Window | null> = ref(null)

const { window } = defineProps({
	window: {
		required: true,
	},
}) as { window: ConfirmWindow }

function confirm() {
	if (!windowElement.value) return

	window.confirm()

	windowElement.value.close()
}

function cancel() {
	if (!windowElement.value) return

	window.cancel()

	windowElement.value.close()
}
</script>

<template>
	<Window :name="t('general.confirm')" id="confirm" ref="windowElement">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-inter">
				{{ t(window.text) }}
			</p>

			<div class="flex justify-end gap-2">
				<Button :text="t('Confirm')" class="font-inter" @click="confirm" />
				<Button :text="t('Cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
