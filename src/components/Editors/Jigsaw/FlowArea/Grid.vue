<template>
	<div
		:style="{
			top: `${(this.y % 42) - 42}px`,
			left: `${(this.x % 42) - 42}px`,
		}"
		class="grid"
		@mousedown.self="$emit('mousedown', $event)"
	/>
</template>

<script>
export default {
	props: {
		x: Number,
		y: Number,
	},
}
</script>

<style scoped>
.grid {
	position: absolute;
	height: calc(100% + 84px);
	width: calc(100% + 84px);
	background-image: repeating-linear-gradient(
			#555555 0 1px,
			transparent 1px 100%
		),
		repeating-linear-gradient(90deg, #555555 0 1px, transparent 1px 100%);
	background-size: 42px 42px;
	background-repeat: repeat;
}
.theme--light .grid {
	background-image: repeating-linear-gradient(
			#a4a4a4 0 1px,
			transparent 1px 100%
		),
		repeating-linear-gradient(90deg, #a4a4a4 0 1px, transparent 1px 100%);
}
</style>
