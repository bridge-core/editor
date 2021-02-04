<template>
	<div class="body-1 pa-4 mb-2 rounded-lg control-bg">
		<div class="d-flex align-center">
			<v-icon v-if="action.icon" color="accent" class="mr-1">
				{{ action.icon }}
			</v-icon>
			<h3>{{ t(action.name) }}</h3>

			<v-spacer />
			<span v-if="action.keyBinding">
				{{ action.keyBinding.toStrKeyCode() }}
			</span>
			<v-btn v-if="!hideTriggerButton" color="primary" small icon>
				<v-icon @click="onTrigger">mdi-play</v-icon>
			</v-btn>
		</div>

		<span>{{ t(action.description) }}</span>
	</div>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'

export default {
	props: {
		action: Object,
		hideTriggerButton: Boolean,
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
}
</style>
