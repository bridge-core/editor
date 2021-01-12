<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		:hasCloseButton="false"
		:isPersistent="typeof this.callback === 'function'"
	>
		<template #default>
			<p class="mt-2">{{ t(content) }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="close">
				<v-icon>mdi-check</v-icon>
				<span>{{ t('windows.common.information.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import BaseWindow from '@/components/Windows/Layout/BaseWindow'

export default {
	name: 'Information',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		close() {
			this.currentWindow.close()
			if (typeof this.callback === 'function') this.callback()
		},
	},
}
</script>

<style></style>
