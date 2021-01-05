<template>
	<MenuButton
		v-if="shouldShow"
		@click="prompt"
		displayIcon="mdi-download"
		displayName="toolbar.installApp"
	/>
</template>

<script>
import MenuButton from './Menu/Button.vue'

export default {
	components: {
		MenuButton,
	},
	data: () => ({
		shouldShow: false,
		installEvent: null,
	}),
	mounted() {
		window.addEventListener('beforeinstallprompt', event => {
			event.preventDefault()
			this.installEvent = event
			this.shouldShow = true
		})
	},
	methods: {
		prompt() {
			if (this.installEvent) {
				this.installEvent.prompt()
				this.shouldShow = false
			}
		},
	},
}
</script>

<style></style>
