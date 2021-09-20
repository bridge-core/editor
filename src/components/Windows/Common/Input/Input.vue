<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="$data.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="d-flex justify-center align-center">
				<v-text-field
					:label="t($data.label)"
					v-model="$data.inputValue"
					@keydown.enter.native="onConfirm"
					class="mr-2"
					outlined
					dense
					:autofocus="pointerDevice === 'mouse'"
					hide-details
				/>
				<span
					class="expand-text text--secondary"
					v-if="$data.expandText !== ''"
				>
					{{ $data.expandText }}
				</span>
			</div>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="$data.inputValue === ''"
			>
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '../../Layout/BaseWindow.vue'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	name: 'Input',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	setup() {
		return { pointerDevice }
	},
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close(null)
			this.currentWindow.inputValue = ''
		},
		onConfirm() {
			this.currentWindow.confirm()
			this.currentWindow.inputValue = ''
		},
	},
}
</script>
