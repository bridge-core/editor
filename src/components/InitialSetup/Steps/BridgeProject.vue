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
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { FileSystemSetup } from '/@/components/FileSystem/Setup'
import { VirtualDirectoryHandle } from '/@/components/FileSystem/Virtual/DirectoryHandle'
import { importFromBrproject } from '../../Projects/Import/fromBrproject'
import { LoadingWindow } from '../../Windows/LoadingWindow/LoadingWindow'

export default {
	components: { ActionViewer },
	async mounted() {
		FileSystemSetup.state.receiveDirectoryHandle.dispatch(
			new VirtualDirectoryHandle(null, 'bridgeFolder', undefined)
		)
		await FileSystemSetup.state.setupDone
	},
	data() {
		return {
			actions: [
				new SimpleAction({
					icon: 'mdi-plus',
					name: 'initialSetup.step.bridgeProject.createNew.name',
					description:
						'initialSetup.step.bridgeProject.createNew.description',
					onTrigger: async () => {
						this.$emit('next')
					},
				}),
				new SimpleAction({
					icon: 'mdi-import',
					name: 'initialSetup.step.bridgeProject.importExisting.name',
					description:
						'initialSetup.step.bridgeProject.importExisting.description',
					onTrigger: async () => {
						let fileHandle
						try {
							;[fileHandle] = await window.showOpenFilePicker({
								multiple: false,
								types: [
									{
										description: 'bridge. Project',
										accept: {
											'application/zip': ['.brproject'],
										},
									},
								],
							})
						} catch (err) {
							return
						}
						const lw = new LoadingWindow()
						lw.open()

						await importFromBrproject(fileHandle, true)

						this.$emit('done')
						lw.close()
					},
				}),
			],
		}
	},
}
</script>
