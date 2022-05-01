<template>
	<div
		:class="`component rounded-${roundedType}`"
		:style="{
			position: 'absolute',
			top: `${containerY + this.y * 42 + 3}px`,
			left: `${containerX + this.x * 42 + 3}px`,
			height: '37px',
			width: '37px',
			cursor: 'pointer',
			background: `var(--v-${color}-base)`,
		}"
	>
		<v-icon>{{ icon }}</v-icon>
	</div>
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
			default: 'error',
			type: String,
		},
		icon: String,
		type: {
			type: String,
			default: 'component',
			validate: (val) => ['component', 'event'].includes(val),
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
	},
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
