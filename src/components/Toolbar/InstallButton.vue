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
		window.addEventListener('beforeinstallprompt', this.onInstallPrompt)
	},
	destroyed() {
		window.removeEventListener('beforeinstallprompt', this.onInstallPrompt)
	},
	methods: {
		onInstallPrompt() {
			event.preventDefault()
			this.installEvent = event
			this.shouldShow = true
		},
		prompt() {
			if (this.installEvent) {
				this.installEvent.prompt()

				this.installEvent.userChoice.then(choice => {
					if (choice.outcome === 'accepted') this.shouldShow = false
				})
			}
		},
	},
}
</script>

<style></style>
