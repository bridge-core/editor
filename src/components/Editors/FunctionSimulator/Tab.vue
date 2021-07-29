<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<h1>Test Text</h1>
	</div>
</template>

<script>
export default {
	name: 'FunctionSimulatorTab',
	props: {
		tab: Object,
	},
}
</script>

<style scoped>
.img-preview {
	height: 80%;
	image-rendering: pixelated;
}
</style>
