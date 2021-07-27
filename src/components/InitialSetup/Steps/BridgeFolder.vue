<template>
	<v-btn color="primary" @click="onClick" :disabled="buttonDisabled">
		<v-icon class="mr-1">mdi-folder-open-outline</v-icon>
		{{ t('general.selectFolder') }}
	</v-btn>
</template>

<script>
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import { FileSystemSetup } from '/@/components/FileSystem/Setup'

export default {
	mixins: [TranslationMixin],
	data: () => ({
		buttonDisabled: false,
	}),
	methods: {
		async onClick() {
			let fileHandle
			try {
				fileHandle = await window.showDirectoryPicker({
					writable: true,
					startIn: 'documents',
				})
			} catch {
				return
			}

			if (!fileHandle) return

			FileSystemSetup.state.receiveDirectoryHandle.dispatch(fileHandle)

			this.buttonDisabled = true
			await FileSystemSetup.state.setupDone
			this.$emit('next')
		},
	},
}
</script>
