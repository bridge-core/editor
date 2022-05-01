<template>
	<GridElement
		:isEnabled="boundToGrid"
		:class="`event-line rounded-lg`"
		:background="`var(--v-${color}-base)`"
		:x="x"
		:y="y"
		:yOffset="16"
		:containerX="containerX"
		:containerY="containerY"
	/>
</template>

<script>
import GridElement from './FlowArea/GridElement.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	components: { GridElement },
	mixins: [TranslationMixin],
	props: {
		boundToGrid: {
			type: Boolean,
			default: true,
		},
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
.event-line {
	width: 37px;
	height: 5px;
	overflow: hidden;
	user-select: none;
	cursor: pointer;
	display: inline-grid;
}
</style>
