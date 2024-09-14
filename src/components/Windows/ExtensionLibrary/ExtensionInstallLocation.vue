<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Button from '@/components/Common/Button.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { ExtensionLibraryWindow } from '@/components/Windows/ExtensionLibrary/ExtensionLibrary'
import { Windows } from '../Windows'
import { ExtensionInstallLocationWindow } from './ExtensionLibrary'

const t = useTranslate()

function global() {
	ExtensionLibraryWindow.confirmInstallGlobal()

	Windows.close(ExtensionInstallLocationWindow)
}

function project() {
	ExtensionLibraryWindow.confirmInstallProject()

	Windows.close(ExtensionInstallLocationWindow)
}

function cancel() {
	Windows.close(ExtensionInstallLocationWindow)
}
</script>

<template>
	<Window :name="t('Extension Install Location')" @close="cancel">
		<div class="p-4 h-full flex flex-col justify-between">
			<p class="mb-4 max-w-sm font-inter">
				{{ t('Do you want to install this extension globally or just for this project?') }}
			</p>

			<div class="flex justify-end gap-2 ml-auto">
				<Button :text="t('global')" class="font-inter" @click="global" />
				<Button :text="t('project')" class="font-inter" @click="project" />
				<Button :text="t('cancel')" class="font-inter" @click="cancel" />
			</div>
		</div>
	</Window>
</template>
