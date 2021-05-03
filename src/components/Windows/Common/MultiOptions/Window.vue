<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="$data.name"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="!$data.isClosable"
		:hasCloseButton="false"
		:width="440"
		:height="400"
		@closeWindow="onClose"
	>
		<template #default>
			<v-checkbox
				v-for="(option, i) in $data.options"
				:key="i"
				v-model="option.isSelected"
				:label="option.name"
				hide-details
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="onClose">
				<v-icon>mdi-check</v-icon>
				<span> {{ t('general.confirm') }} </span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import PresetPath from '/@/components/Windows/Project/CreatePreset/PresetPath.vue'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'FilePathWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		PresetPath,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close(
				this.$data.options
					.filter(({ isSelected }) => isSelected)
					.map(({ name }) => name)
			)
		},
	},
}
</script>
