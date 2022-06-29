<template>
	<Name :baseWrapper="fileWrapper" />
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
	data: () => ({
		isFocused: false,
	}),
}
</script>
