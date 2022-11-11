<template>
	<BaseWindow
		v-if="state.shouldRender"
		windowTitle="general.confirm"
		:isVisible="state.isVisible"
		:isPersistent="false"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		:hasCloseButton="false"
		:isSmallPopup="true"
	>
		<template #default>
			<p class="mt-2">{{ t('windows.unsavedFile.description') }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="menu" @click="onCancel">
				<span>{{ t('general.cancel') }}</span>
			</v-btn>
			<v-btn color="error" @click="onNoSave">
				<span>{{ t('general.close') }}</span>
			</v-btn>
			<v-btn v-if="window.canSaveTab" color="primary" @click="onSave">
				<span>{{ t('windows.unsavedFile.save') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '../Layout/BaseWindow.vue'
import { useTranslations } from '../../Composables/useTranslations'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onCancel() {
	props.window.cancel()
}
function onNoSave() {
	props.window.noSave()
}
function onSave() {
	props.window.save()
}
</script>
