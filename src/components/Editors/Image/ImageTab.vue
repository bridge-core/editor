<template>
	<div
		class="d-flex align-center justify-center"
		@click="tab.parent.setActive(true)"
	>
		<img
			:src="tab.dataUrl"
			:alt="tab.path"
			class="img-preview"
			draggable="false"
		/>
	</div>
</template>

<script>
export default {
	name: 'ImageTab',
	props: {
		tab: Object,
	},
}
</script>

<style scoped>
.img-preview {
	height: 80%;
	image-rendering: pixelated;
	overflow: hidden;
}
</style>
