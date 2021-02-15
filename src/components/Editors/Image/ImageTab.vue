<template>
	<div
		class="d-flex align-center justify-center"
		style="height:calc(100% - 48px);"
	>
		<img :src="tab.dataUrl" :alt="tab.path" class="img-preview" />
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
	height: calc(80% - 48px);
	image-rendering: pixelated;
}
</style>
