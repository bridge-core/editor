<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.common.confirm.title"
		:isVisible="isVisible"
		:isPersistent="true"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		:hasCloseButton="false"
	>
		<template #default>
			<p class="mt-2">{{ content }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="onCancel"
				><span>{{ cancelText }}</span></v-btn
			>
			<v-btn color="primary" @click="onConfirm"
				><span>{{ confirmText }}</span></v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import BaseWindow from '../../Layout/BaseWindow'

export default {
	name: 'Confirm',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onCancel() {
			this.currentWindow.close()
			this.onCancelCb()
		},
		onConfirm() {
			this.currentWindow.close()
			this.onConfirmCb()
		},
	},
}
</script>

<style></style>
