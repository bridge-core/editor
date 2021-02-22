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
				<v-icon color="error" style="font-size: 8em;">
					mdi-alert-octagon-outline
				</v-icon>
				<p>{{ t('windows.browserUnsupported.description') }}</p>
			</div>
		</template>
	</BaseWindow>
</template>

<script>
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
	},
}
</script>

<style></style>
