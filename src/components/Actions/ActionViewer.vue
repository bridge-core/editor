<template>
	<div class="pa-4 mb-2 rounded-lg control-bg" :class="{ selected, dark }">
		<div class="d-flex align-center">
			<v-icon
				v-if="action.icon"
				:color="action.color || 'accent'"
				class="mr-1"
			>
				{{ action.icon }}
			</v-icon>
			<h3>{{ t(action.name) }}</h3>

			<v-spacer />
			<span v-if="action.keyBinding">
				{{ action.keyBinding.toStrKeyCode() }}
			</span>
			<v-btn
				v-if="!hideTriggerButton"
				:color="action.color || 'accent'"
				small
				icon
			>
				<v-icon @click="onTrigger">mdi-play</v-icon>
			</v-btn>
			<v-icon v-if="selected !== undefined">
				{{
					selected
						? 'mdi-check-circle-outline'
						: 'mdi-checkbox-blank-circle-outline'
				}}
			</v-icon>
		</div>

		<p v-if="!dense && action.description">
			{{ t(action.description) }}
		</p>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	props: {
		action: Object,
		hideTriggerButton: Boolean,
		dense: Boolean,
		dark: Boolean,
		selected: {
			type: Boolean,
			default: undefined,
		},
	},
	mixins: [TranslationMixin],
	methods: {
		onTrigger() {
			this.action.trigger()
		},
	},
}
</script>

<style scoped>
.control-bg {
	background-color: var(--v-sidebarNavigation-base);
	border: 1px solid var(--v-sidebarNavigation-base);
}
.dark {
	background-color: var(--v-background-base);
	border: 1px solid var(--v-background-base);
}
.selected {
	border: 1px solid var(--v-primary-base);
}
</style>
