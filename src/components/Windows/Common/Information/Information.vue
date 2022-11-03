<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="window.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="124"
		:hasCloseButton="false"
		:isPersistent="window.isPersistent"
		:isSmallPopup="true"
	>
		<template #default>
			<p class="mt-2">{{ t(window.description) }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="close">
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { useTranslations } from '/@/components/Composables/useTranslations'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function close() {
	props.window.close()
}
</script>
