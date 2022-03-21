<template>
	<v-card color="transparent" elevation="0">
		<ActionViewer
			v-for="(action, i) in actions"
			:key="i"
			class="clickable"
			:action="action"
			hideTriggerButton
			v-ripple
			@click="action.trigger()"
		/>
	</v-card>
</template>

<script>
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { App } from '/@/App'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'

export default {
	components: {
		ActionViewer,
	},
	data() {
		return {
			isLoading: false,
			actions: [
				new SimpleAction({
					icon: 'mdi-text',
					name: 'initialSetup.step.editorType.rawText.name',
					description:
						'initialSetup.step.editorType.rawText.description',
					onTrigger: async () => {
						if (this.isLoading) return

						this.isLoading = true
						await this.setJsonEditor('rawText')
						this.$emit('next')
					},
				}),
				new SimpleAction({
					icon: 'mdi-file-tree',
					name: 'initialSetup.step.editorType.treeEditor.name',
					description:
						'initialSetup.step.editorType.treeEditor.description',
					onTrigger: async () => {
						if (this.isLoading) return

						this.isLoading = true
						await this.setJsonEditor('treeEditor')
						this.$emit('next')
					},
				}),
			],
		}
	},
	methods: {
		async setJsonEditor(val) {
			await SettingsWindow.loadSettings(App.instance)
			if (!settingsState.editor) settingsState.editor = {}
			settingsState.editor.jsonEditor = val
			await SettingsWindow.saveSettings(App.instance)
		},
	},
}
</script>
