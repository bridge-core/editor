<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="general.confirm"
		:isVisible="isVisible"
		:isPersistent="true"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		:hasCloseButton="false"
		:isSmallPopup="true"
	>
		<template #default>
			<p class="mt-2">{{ t($data.description) }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="onCancel">
				<v-icon class="mr-1">mdi-close</v-icon>
				<span>{{ t($data.cancelText) }}</span>
			</v-btn>
			<v-btn color="primary" @click="onConfirm">
				<v-icon class="mr-1">mdi-check</v-icon>
				<span>{{ t($data.confirmText) }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

export default {
	name: 'Confirm',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onCancel() {
			this.currentWindow.onCancel()
		},
		onConfirm() {
			this.currentWindow.onConfirm()
		},
	},
}
</script>
