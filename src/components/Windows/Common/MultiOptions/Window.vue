<template>
	<BaseWindow
		v-if="state.shouldRender"
		:windowTitle="window.name"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="!window.isClosable"
		:hasCloseButton="false"
		:width="440"
		:height="400"
		@closeWindow="onClose"
	>
		<template #default>
			<v-checkbox
				v-for="(option, i) in window.options"
				:key="i"
				v-model="option.isSelected"
				:label="option.name"
				hide-details
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="onClose">
				<v-icon>mdi-check</v-icon>
				<span> {{ t('general.confirm') }} </span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { useTranslations } from '/@/components/Composables/useTranslations'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close(
		props.window.options
			.filter(({ isSelected }: any) => isSelected)
			.map(({ name }: any) => name)
	)
}
</script>
