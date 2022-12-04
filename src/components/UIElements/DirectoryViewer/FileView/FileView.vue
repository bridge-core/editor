<template>
	<!-- <Name :baseWrapper="fileWrapper" :diagnostic="diagnostic" /> -->
	<SolidView
		:component="SolidName"
		:props="{
			tagName: 'div',
			baseWrapper: fileWrapper,
		}"
	/>
</template>

<script>
import Name from '../Common/Name.vue'
import SolidView from '/@/components/UIElements/SolidView.vue'
import { FileWrapper } from './FileWrapper'
import { Name as SolidName } from '/@/components/Solid/DirectoryViewer/Common/Name.tsx'

export default {
	components: { Name, SolidView },
	name: 'FileView',
	props: {
		fileWrapper: FileWrapper,
	},
	setup() {
		return {
			SolidName,
		}
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
