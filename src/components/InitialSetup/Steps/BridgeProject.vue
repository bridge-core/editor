<template>
	<v-card color="transparent" elevation="0">
		<ActionViewer
			v-for="(action, i) in actions"
			:key="i"
			class="clickable"
			:action="action"
			hideTriggerButton
			v-ripple
			@click.native="action.trigger()"
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
			new VirtualDirectoryHandle(null, 'global')
		)
		await FileSystemSetup.state.setupDone
	},
	data() {
		return {
			isLoading: false,
			actions: [
				new SimpleAction({
					icon: 'mdi-plus',
					name: 'initialSetup.step.bridgeProject.createNew.name',
					description:
						'initialSetup.step.bridgeProject.createNew.description',
					onTrigger: async () => {
						if (this.isLoading) return

						this.$emit('next')
					},
				}),
				new SimpleAction({
					icon: 'mdi-import',
					name: 'initialSetup.step.bridgeProject.importExisting.name',
					description:
						'initialSetup.step.bridgeProject.importExisting.description',
					onTrigger: async () => {
						if (this.isLoading) return

						const lw = new LoadingWindow()
						lw.open()

						this.isLoading = true

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
							this.isLoading = false
							lw.close()
							return
						}

						await importFromBrproject(fileHandle, true)

						this.$emit('done')
						this.isLoading = false
						lw.close()
					},
				}),
			],
		}
	},
}
</script>
