<template>
	<v-btn
		:max-height="appToolbarHeight"
		flat
		size="small"
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
			:size="$vuetify.display.mobile ? 'xsmall' : '16px'"
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

<style>
.toolbar-btn .v-btn__underlay {
	background: none !important;
}
</style>

<style scoped>
.toolbar-btn {
	min-width: 0;
	padding: 0 8px;
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
