<template>
	<v-dialog
		v-if="shouldRender"
		v-model="isWindowOpen"
		content-class="elevation-0 d-flex pt-2 flex-column justify-center align-center"
		transition="slide-y-reverse-transition"
		width="60vw"
		max-width="600px"
		hide-overlay
		@keydown.esc="isWindowOpen = false"
	>
		<CommandBar
			autofocus
			@actionSelected="isWindowOpen = false"
			@blur="isWindowOpen = false"
		/>
		<div
			@click="isWindowOpen = false"
			:style="{
				height: '80vh',
			}"
		/>
	</v-dialog>
</template>

<script>
import CommandBar from './CommandBar.vue'
import { CommandBarState } from './State'
export default {
	components: { CommandBar },
	data: () => CommandBarState,
	watch: {
		isWindowOpen() {
			if (this.isWindowOpen) {
				this.shouldRender = true
				if (this.closeDelay) clearTimeout(this.closeDelay)
			} else {
				this.closeDelay = setTimeout(() => {
					this.shouldRender = false
					this.closeDelay = null
				}, 300)
			}
		},
	},
}
</script>
