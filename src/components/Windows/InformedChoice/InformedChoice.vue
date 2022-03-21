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
			<InfoPanel
				v-if="currentWindow.topPanel"
				class="mb-2"
				:infoPanel="currentWindow.topPanel"
			/>

			<ActionViewer
				v-for="(action, id) in $data._actionManager.state"
				:key="id"
				:action="action"
				:hideTriggerButton="true"
				v-ripple
				@click="onClick(action)"
				style="cursor: pointer"
			/>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'

export default {
	name: 'InformedChoiceWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		ActionViewer,
		InfoPanel,
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
