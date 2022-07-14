<template>
	<Name :baseWrapper="fileWrapper" :diagnostic="diagnostic" />
</template>

<script>
import Name from '../Common/Name.vue'
import { FileWrapper } from './FileWrapper'

export default {
	components: { Name },
	name: 'FileView',
	props: {
		fileWrapper: FileWrapper,
	},
	mounted() {
		this.fileWrapper.getFirstDiagnostic().then((diagnostic) => {
			this.diagnostic = diagnostic
		})
	},
	data: () => ({
		isFocused: false,
		diagnostic: undefined,
	}),
}
</script>
