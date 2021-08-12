<template>
	<v-btn
		small
		text
		class="toolbar-btn"
		@click="$emit('click', $event)"
		:disabled="disabled"
	>
		<v-icon
			v-if="displayIcon"
			color="accent"
			style="margin-right: 6px; font-style: normal"
		>
			{{ displayIcon }}
		</v-icon>

		<span> {{ t(displayName) }} </span>
	</v-btn>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'MenuButton',
	mixins: [TranslationMixin],
	props: {
		displayName: String,
		displayIcon: String,
		disabled: {
			type: Boolean,
		},
	},
}
</script>

<style scoped>
.toolbar-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
}
</style>
