<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { Ref, ref } from 'vue'
import { extensionLibrary } from '@/App'

const t = useTranslate()

const window: Ref<Window | null> = ref(null)

function global() {
	if (!window.value) return

	extensionLibrary.confirmInstallGlobal()

	window.value.close()
}

function project() {
	if (!window.value) return

	extensionLibrary.confirmInstallProject()

	window.value.close()
}

function cancel() {
	if (!window.value) return

	window.value.close()
}
</script>

<template>
	<Window :name="t('Extension Install Location')" id="extensionInstallLocation" ref="window">
		<div class="p-4">
			<p class="mb-4 max-w-sm font-inter">
				{{ t('Do you want to install this extension globally or just for this project?') }}
			</p>

			<div class="flex justify-end gap-2">
				<Button :text="t('global')" class="font-inter" @click="global" />
				<Button :text="t('project')" class="font-inter" @click="project" />
				<Button :text="t('cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
