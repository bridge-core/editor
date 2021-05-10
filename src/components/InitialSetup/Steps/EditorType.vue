<template>
	<v-card color="transparent" elevation="0">
		<ActionViewer
			v-for="(action, i) in actions"
			:key="i"
			:action="action"
			hideTriggerButton
			v-ripple
			@click.native="action.trigger()"
		/>
	</v-card>
</template>

<script>
import { SimpleAction } from '../../Actions/SimpleAction'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'

export default {
	components: {
		ActionViewer,
	},
	data() {
		return {
			actions: [
				new SimpleAction({
					icon: 'mdi-text',
					name: 'initialSetup.step.editorType.rawText.name',
					description:
						'initialSetup.step.editorType.rawText.description',
					onTrigger: () => {
						this.$emit('next')
					},
				}),
				new SimpleAction({
					icon: 'mdi-file-tree',
					name: 'initialSetup.step.editorType.treeEditor.name',
					description:
						'initialSetup.step.editorType.treeEditor.description',
					onTrigger: () => {
						this.$emit('next')
					},
				}),
			],
		}
	},
}
</script>

<style></style>
