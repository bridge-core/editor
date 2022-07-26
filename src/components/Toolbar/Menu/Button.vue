<template>
	<v-btn
		small
		text
		@click="$emit('click', $event)"
		:disabled="disabled"
		class="toolbar-btn"
		:class="{
			'btn-enabled': !disabled,
			'btn-disabled': disabled,
			'px-1': $vuetify.breakpoint.mobile,
		}"
	>
		<v-icon v-if="displayIcon" color="accent" class="pr-1">
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
	min-width: 0;
}
.btn-disabled {
	-webkit-app-region: drag;
	app-region: drag;
}
.btn-enabled {
	-webkit-app-region: no-drag;
	app-region: no-drag;
}
</style>
