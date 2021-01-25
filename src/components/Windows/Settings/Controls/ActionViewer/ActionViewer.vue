<template>
	<div class="body-1 pa-4 mb-2 rounded-lg control-bg">
		<div class="d-flex align-center">
			<v-icon color="accent" class="mr-1">{{ action.icon }}</v-icon>
			<h3>{{ t(action.name) }}</h3>

			<v-spacer />
			<span v-if="action.keyBinding">
				{{ action.keyBinding.toStrKeyCode() }}
			</span>
			<v-btn color="primary" small icon>
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
		value: Boolean,
		config: Object,
	},
	mixins: [TranslationMixin],
	data: () => ({
		value_: undefined,
	}),
	mounted() {
		this.value_ = this.value
	},
	computed: {
		action() {
			return this.config.action
		},
	},
	methods: {
		onChange(val) {
			this.$emit('change', val)
		},
		onTrigger() {
			this.$emit('closeWindow')
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
