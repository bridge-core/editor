<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="$data.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="!$data.isClosable"
		:hasCloseButton="false"
		:width="440"
		:height="140"
		@closeWindow="onClose"
	>
		<template #default>
			<v-select
				autofocus
				solo
				v-model="$data.currentSelection"
				:items="$data.options"
				background-color="background"
				class="mt-4"
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="$data.currentSelection === ''"
			>
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

export default {
	name: 'Dropdown',
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
		onConfirm() {
			this.currentWindow.confirm()
		},
	},
}
</script>
