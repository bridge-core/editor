<template>
	<BaseWindow
		:windowTitle="title"
		:isVisible="isVisible"
		:hasCloseButton="!opts.isPersistent"
		:hasMaximizeButton="false"
		:percentageWidth="50"
		:maxPercentageHeight="80"
		:isPersistent="opts.isPersistent"
		heightUnset
		@closeWindow="onClose"
	>
		<template #default>
			<ActionViewer
				v-for="(action, id) in $data._actionManager.state"
				:key="id"
				:action="action"
				:hideTriggerButton="true"
				v-ripple
				@click.native="onClick(action)"
				style="cursor: pointer;"
			/>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow.vue'
import ActionViewer from '@/components/Actions/ActionViewer.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'InformedChoiceWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		ActionViewer,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onClick(action) {
			action.trigger()
			this.currentWindow.close()
		},
	},
}
</script>
