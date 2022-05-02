<template>
	<GridElement
		:isEnabled="boundToGrid"
		:class="`component rounded-${roundedType}`"
		:background="`var(--v-${color}-base)`"
		:x="x"
		:y="y"
		:containerX="containerX"
		:containerY="containerY"
	>
		<div
			v-for="dir in connectTo"
			:key="dir"
			class="component rounded-lg connect"
			:style="{
				background: `var(--v-${color}-base)`,
				left: `${dir === 'left' ? 12 : dir === 'right' ? -12 : 0}px`,
				top: `${dir === 'up' ? -12 : dir === 'down' ? 12 : 0}px`,
			}"
		/>
		<v-icon>{{ icon }}</v-icon>
	</GridElement>
</template>

<script>
import GridElement from './FlowArea/GridElement.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	components: { GridElement },
	mixins: [TranslationMixin],
	props: {
		boundToGrid: { type: Boolean, default: true },
		x: Number,
		y: Number,
		containerX: Number,
		containerY: Number,
		color: {
			default: 'error',
			type: String,
		},
		icon: String,
		type: {
			type: String,
			default: 'component',
			validate: (val) => ['component', 'event'].includes(val),
		},
		connect: {
			type: [Array, String],
			validate: (val) =>
				val.every((v) => ['left', 'right', 'up', 'down'].includes(v)),
		},
	},
	data: () => ({}),
	computed: {
		roundedType() {
			switch (this.type) {
				case 'component':
					return 'lg'
				case 'event':
					return 'circle'
				default:
					return '0'
			}
		},
		connectTo() {
			return typeof this.connect === 'string'
				? [this.connect]
				: this.connect
		},
	},
}
</script>

<style scoped>
.component {
	user-select: none;
	display: inline-grid;
	height: 37px;
	width: 37px;
	cursor: pointer;
}
.connect {
	position: absolute;
	transform: rotate(45deg) scale(0.5);
}
</style>
