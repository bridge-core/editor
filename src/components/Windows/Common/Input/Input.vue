<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="window.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="d-flex justify-center align-center">
				<v-text-field
					:label="t(window.label)"
					v-model="state.inputValue"
					@keydown.enter.native="onConfirm"
					class="mr-2"
					outlined
					dense
					:autofocus="pointerDevice === 'mouse'"
					hide-details
				/>
				<span
					class="expand-text text--secondary"
					v-if="window.expandText !== ''"
				>
					{{ window.expandText }}
				</span>
			</div>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="state.inputValue === ''"
			>
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '../../Layout/BaseWindow.vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import { pointerDevice } from '/@/utils/pointerDevice'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close(null)
	state.inputValue = ''
}
function onConfirm() {
	props.window.confirm()
	state.inputValue = ''
}
</script>
