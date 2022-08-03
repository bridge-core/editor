<template>
	<BaseWindow
		:windowTitle="window.message || 'windows.loadingWindow.titles.loading'"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="false"
		:isPersistent="true"
		:isFullscreen="false"
		:width="300"
		:height="40"
		@closeWindow="onClose"
		:isSmallPopup="true"
	>
		<template #default>
			<v-progress-linear indeterminate />
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close()
}
</script>
