<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="general.confirm"
		:isVisible="isVisible"
		:isPersistent="false"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		:hasCloseButton="false"
		:isSmallPopup="true"
	>
		<template #default>
			<p class="mt-2">{{ t('windows.unsavedFile.description') }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="menu" @click="onCancel">
				<span>{{ t('general.cancel') }}</span>
			</v-btn>
			<v-btn color="error" @click="onNoSave">
				<span>{{ t('general.close') }}</span>
			</v-btn>
			<v-btn color="primary" @click="onSave">
				<span>{{ t('windows.unsavedFile.save') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '../Layout/BaseWindow.vue'

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
			this.currentWindow.cancel()
		},
		onNoSave() {
			this.currentWindow.noSave()
		},
		onSave() {
			this.currentWindow.save()
		},
	},
}
</script>

<style></style>
