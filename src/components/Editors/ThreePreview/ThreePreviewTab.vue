<template>
	<div @click="tab.parent.setActive(true)">
		<canvas ref="canvas" />
	</div>
</template>

<script>
export default {
	name: 'ThreePreviewTab',
	props: {
		tab: Object,
	},
	activated() {
		this.tab.receiveCanvas(this.$refs.canvas)
	},
	mounted() {
		this.tab.receiveCanvas(this.$refs.canvas)
	},
	watch: {
		tab() {
			this.tab.receiveCanvas(this.$refs.canvas)
		},
	},
}
</script>
