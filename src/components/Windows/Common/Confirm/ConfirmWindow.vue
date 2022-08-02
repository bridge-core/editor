<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="window.title"
		:isVisible="state.isVisible"
		:isPersistent="true"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="window.height"
		:hasCloseButton="false"
		:isSmallPopup="true"
	>
		<template #default>
			<p class="mt-2">{{ t(window.description) }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="sidebarSelection" @click="onCancel">
				<v-icon class="mr-1">mdi-close</v-icon>
				<span>{{ t(window.cancelText) }}</span>
			</v-btn>
			<v-btn color="primary" @click="onConfirm">
				<v-icon class="mr-1">mdi-check</v-icon>
				<span>{{ t(window.confirmText) }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onCancel() {
	props.window.onCancel()
}
function onConfirm() {
	props.window.onConfirm()
}
</script>
