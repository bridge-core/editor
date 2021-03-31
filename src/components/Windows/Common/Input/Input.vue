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
			<v-row>
				<v-text-field
					:label="$data.label"
					v-model="$data.inputValue"
					@keydown.enter.native="onConfirm"
					autofocus
				/>
				<p class="expand_text" v-if="$data.expandText !== ''">
					{{ $data.expandText }}
				</p>
			</v-row>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="$data.inputValue === ''"
			>
				<span>{{ t('windows.common.input.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '../../Layout/BaseWindow.vue'

export default {
	name: 'Input',
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
			this.currentWindow.inputValue = ''
		},
		onConfirm() {
			this.currentWindow.close()
			this.currentWindow.confirm()
			this.currentWindow.inputValue = ''
		},
	},
}
</script>

<style scoped>
.expand_text {
	opacity: 60%;
	padding-top: 26px;
}
</style>
