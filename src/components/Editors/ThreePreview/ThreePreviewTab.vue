<template>
	<div style="position: relative">
		<div
			style="width: 100%; height: 100%"
			@click="tab.parent.setActive(true)"
		>
			<canvas ref="canvas" />
		</div>
		<!-- <div
			style="
				position: absolute;
				top: 0;
				pointer-events: none;
				width: 100%;
				height: 100%;
			"
		>
			 TODO: Use this slot for 3D UI overlay
		</div> -->
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
		'tab.uuid'() {
			this.tab.receiveCanvas(this.$refs.canvas)
		},
	},
}
</script>
