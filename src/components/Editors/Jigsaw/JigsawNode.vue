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
			v-if="connection === 'left'"
			class="component rounded-lg connection"
			:style="`background: var(--v-${color}-base)`"
		></div>
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
		connection: String,
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
.connection {
	position: absolute;
	transform: rotate(45deg) scale(0.5);
	left: 12px;
}
</style>
