<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { confirmWindow } from '@/App'
import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'

const t = useTranslate()

const window: Ref<Window | null> = ref(null)

function confirm() {
	if (!window.value) return

	confirmWindow.confirm()

	window.value.close()
}

function cancel() {
	if (!window.value) return

	confirmWindow.cancel()

	window.value.close()
}
</script>

<template>
	<Window :name="t('general.confirm')" id="confirm" ref="window">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-inter">
				{{ t(confirmWindow.text) }}
			</p>

			<div class="flex justify-end gap-2">
				<Button
					:text="t('confirm')"
					class="font-inter"
					@click="confirm"
				/>
				<Button
					:text="t('cancel')"
					class="font-inter"
					@click="cancel"
				/>
			</div>
		</div>
	</Window>
</template>
