<template>
	<v-btn
		:max-height="appToolbarHeight"
		text
		@click="$emit('click', $event)"
		:disabled="disabled"
		class="toolbar-btn"
		:class="{
			'btn-enabled': !disabled,
			'btn-disabled': disabled,
			'px-1': $vuetify.display.mobile,
		}"
	>
		<v-icon
			v-if="displayIcon"
			color="accent"
			:x-small="$vuetify.display.mobile"
			:class="{ 'pr-1': !$vuetify.display.mobile }"
		>
			{{ displayIcon }}
		</v-icon>

		<span> {{ t(displayName) }} </span>
	</v-btn>
</template>

<script>
import { AppToolbarHeightMixin } from '../../Mixins/AppToolbarHeight'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'MenuButton',
	mixins: [TranslationMixin, AppToolbarHeightMixin],
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
