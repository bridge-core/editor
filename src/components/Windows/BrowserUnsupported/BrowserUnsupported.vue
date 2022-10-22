<template>
	<BaseWindow
		v-if="state.shouldRender"
		windowTitle="windows.browserUnsupported.title"
		:isVisible="state.isVisible"
		:isPersistent="true"
		:hasCloseButton="false"
		:width="420"
		:height="240"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="text-center">
				<v-icon color="warning" style="font-size: 8em">
					mdi-alert-octagon-outline
				</v-icon>
				<p>{{ t('windows.browserUnsupported.description') }}</p>
			</div>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn @click="onContinue" color="error">
				<v-icon class="mr-1">mdi-check</v-icon>
				{{ t('windows.browserUnsupported.continue') }}
			</v-btn>
			<v-spacer />
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { set } from 'idb-keyval'
import BaseWindow from '../Layout/BaseWindow.vue'
import { useTranslations } from '../../Composables/useTranslations'

const { t } = useTranslations()

const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close()
}
async function onContinue() {
	await set('confirmedUnsupportedBrowser', true)
	onClose()
}
</script>
