<template>
	<v-btn
		small
		text
		class="toolbar-btn"
		@click="$emit('click', $event)"
		:disabled="disabled"
		:class="{ 'px-1': $vuetify.breakpoint.mobile }"
	>
		<v-icon
			v-if="displayIcon"
			color="accent"
			:x-small="$vuetify.breakpoint.mobile"
			:class="{ 'pr-1': !$vuetify.breakpoint.mobile }"
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
