<template>
	<BaseWindow
		:windowTitle="`[${window.title}]`"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:actions="state.actions"
		:isLoading="state.isLoading"
	>
		<div :id="window.id">
			<component
				class="blockbench dialog_content"
				:is="window.contentComponent"
			/>
		</div>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { useTranslations } from '/@/components/Composables/useTranslations'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close()
}
</script>
