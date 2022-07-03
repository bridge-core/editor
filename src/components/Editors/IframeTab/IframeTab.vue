<template>
	<div ref="container"></div>
</template>

<script>
import { App } from '/@/App'

export default {
	name: 'HTMLPreviewTab',
	props: {
		tab: Object,
	},
	async mounted() {
		const app = await App.getApp()
		setTimeout(() => this.updateIframe(), 50)

		this.disposable = app.windowResize.on(() => {
			setTimeout(() => this.updateIframe(), 50)
		})
	},
	destroyed() {
		if (this.disposable) {
			this.disposable.dispose()
			this.disposable = null
		}
	},
	data: () => ({
		disposable: null,
	}),
	methods: {
		async updateIframe() {
			await this.tab.fired
			if (!this.$refs.container) return
			// Node is not mounted yet
			if (!this.$refs.container.isConnected) {
				// Try again in 50ms
				setTimeout(() => this.updateIframe(), 50)
				return
			}
			const {
				width,
				height,
				top,
				left,
			} = this.$refs.container.getBoundingClientRect()

			this.tab.iframe.height = `${height - 16}px`
			this.tab.iframe.width = `${width - 16}px`
			this.tab.iframe.style.top = `${top}px`
			this.tab.iframe.style.left = `${left}px`
		},
	},
	watch: {
		tab() {
			setTimeout(() => this.updateIframe(), 50)
		},
	},
}
</script>

<style>
iframe {
	border: 0;
}
</style>
