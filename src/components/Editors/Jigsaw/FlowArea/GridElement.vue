<template>
	<div
		:style="{
			position: isEnabled ? 'absolute' : undefined,
			top: `${containerY + this.y * 42 + 3 + yOffset}px`,
			left: `${containerX + this.x * 42 + 3}px`,
			background,
			cursor,
		}"
	>
		<slot />
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		isEnabled: {
			type: Boolean,
			default: true,
		},
		x: Number,
		y: Number,
		yOffset: { type: Number, default: 0 },
		containerX: Number,
		containerY: Number,
		background: String,
		cursor: String,
	},
}
</script>
