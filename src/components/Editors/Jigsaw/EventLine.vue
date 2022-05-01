<template>
	<div
		:class="`component rounded-lg`"
		:style="{
			position: 'absolute',
			top: `${containerY + this.y * 42 + 19}px`,
			left: `${containerX + this.x * 42 + 3}px`,
			height: '5px',
			width: '37px',
			cursor: 'pointer',
			background: `var(--v-${color}-base)`,
		}"
	/>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		x: Number,
		y: Number,
		containerX: Number,
		containerY: Number,
		color: {
			default: 'info',
			type: String,
		},
	},
	data: () => ({}),
}
</script>

<style scoped>
.component {
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
	display: inline-grid;
}
</style>
