<template>
	<div>
		<ActionViewer
			v-for="(action, i) in data"
			:key="i"
			:action="action"
			:hideTriggerButton="true"
			v-ripple
			@click.native="action.trigger()"
			style="cursor: pointer"
		/>
	</div>
</template>

<script>
import ActionViewer from '/@/components/Actions/ActionViewer.vue'

export default {
	props: {
		data: Array,
	},
	components: {
		ActionViewer,
	},
}
</script>
