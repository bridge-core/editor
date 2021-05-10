<template>
	<v-btn color="primary" @click="onClick">Select Folder</v-btn>
</template>

<script>
export default {
	methods: {
		async onClick() {
			this.$emit('next')
		},
	},
}
</script>
