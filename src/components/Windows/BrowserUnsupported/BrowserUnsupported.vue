<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.browserUnsupported.title"
		:isVisible="isVisible"
		:isPersistent="true"
		:hasCloseButton="false"
		:width="420"
		:height="240"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="text-center">
				<v-icon color="error" style="font-size: 8em">
					mdi-alert-octagon-outline
				</v-icon>
				<p>{{ t('windows.browserUnsupported.description') }}</p>
			</div>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn @click="onContinue" color="error">
				<v-icon class="mr-1">mdi-check</v-icon>
				{{ t('windows.browserUnsupported.continue') }}
			</v-btn>
			<v-spacer />
		</template>
	</BaseWindow>
</template>

<script>
import { set } from 'idb-keyval'
import BaseWindow from '../Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'Discord',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},

	methods: {
		onClose() {
			this.currentWindow.close()
		},
		async onContinue() {
			await set('confirmedUnsupportedBrowser', true)
			this.onClose()
		},
	},
}
</script>

<style></style>
