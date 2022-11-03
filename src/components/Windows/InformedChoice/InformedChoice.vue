<template>
	<BaseWindow
		:windowTitle="window.title"
		:isVisible="state.isVisible"
		:hasCloseButton="!window.opts.isPersistent"
		:hasMaximizeButton="false"
		:percentageWidth="50"
		:maxPercentageHeight="80"
		:isPersistent="window.opts.isPersistent"
		heightUnset
		@closeWindow="onClose"
	>
		<template #default>
			<InfoPanel
				v-if="window.topPanel"
				class="mb-2"
				:infoPanel="window.topPanel"
			/>

			<ActionViewer
				v-for="(action, id) in state.actionManager.state"
				:key="id"
				:action="action"
				:hideTriggerButton="true"
				v-ripple
				@click.native="onClick(action)"
				style="cursor: pointer"
			/>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'
import type { SimpleAction } from '../../Actions/SimpleAction'

const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close()
}
function onClick(action: SimpleAction) {
	action.trigger()
	props.window.close()
}
</script>
