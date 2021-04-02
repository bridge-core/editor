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
	mounted() {
		this.tab.receiveCanvas(this.$refs.canvas)
	},
}
</script>
