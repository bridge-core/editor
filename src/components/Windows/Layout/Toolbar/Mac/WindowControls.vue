<template>
	<div style="position: fixed; z-index: 1;">
		<MacButton
			v-if="hasCloseButton"
			color="error"
			@click="$emit('closeWindow')"
		/>

		<MacButton
			v-if="hasCloseButton"
			color="warning"
			:disabled="!hasMinimizeButton"
			@click="$emit('minimizeWindow')"
		/>

		<MacButton
			v-if="hasCloseButton"
			color="success"
			:disabled="!hasMaximizeButton"
			@click="$emit('toggleFullscreen')"
		/>
	</div>
</template>

<script>
import MacButton from './Button.vue'

export default {
	components: {
		MacButton,
	},
	props: {
		hasCloseButton: {
			type: Boolean,
			default: true,
		},
		hasMinimizeButton: {
			type: Boolean,
			default: false,
		},
		hasMaximizeButton: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>

<style></style>
