<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="$data.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		:hasCloseButton="false"
		:isPersistent="$data.isPersistent"
	>
		<template #default>
			<p class="mt-2">{{ t($data.description) }}</p>
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
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

export default {
	name: 'Information',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
	},
}
</script>

<style></style>
