<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="window.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="!window.isClosable"
		:hasCloseButton="false"
		:width="440"
		:height="140"
		@closeWindow="onClose"
	>
		<template #default>
			<v-autocomplete
				:autofocus="pointerDevice === 'mouse'"
				outlined
				dense
				v-model="state.currentSelection"
				:items="window.options"
				background-color="background"
				class="mt-4"
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="!state.currentSelection"
			>
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { useTranslations } from '/@/components/Composables/useTranslations'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { pointerDevice } from '/@/utils/pointerDevice'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close(null)
}
function onConfirm() {
	props.window.confirm()
}
</script>
