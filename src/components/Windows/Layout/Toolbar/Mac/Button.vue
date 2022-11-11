<template>
	<v-icon
		:color="
			disabled || !windowHasFocus
				? isDarkMode
					? 'grey darken-2'
					: 'grey'
				: color
		"
		small
		@click.stop="$emit('click')"
		v-ripple="!disabled"
		style="font-size: 15px"
		class="mr-1"
	>
		mdi-checkbox-blank-circle
	</v-icon>
</template>

<script>
export default {
	props: {
		color: String,
		disabled: Boolean,
	},
	data: () => ({
		windowHasFocus: true,
	}),
	mounted() {
		window.addEventListener('focus', this.enableButton)
		window.addEventListener('blur', this.disableButton)
	},
	destroyed() {
		window.removeEventListener('focus', this.enableButton)
		window.removeEventListener('blur', this.disableButton)
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
	methods: {
		disableButton() {
			this.windowHasFocus = false
		},
		enableButton() {
			this.windowHasFocus = true
		},
	},
}
</script>

<style></style>
