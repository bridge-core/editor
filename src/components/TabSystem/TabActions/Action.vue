<template>
	<div
		class="d-flex px-1 mx-1 align-center action"
		:style="{
			opacity: action.isDisabled ? 0.2 : 1,
			cursor: !action.isDisabled ? 'pointer' : null,
		}"
		v-ripple="!action.isDisabled"
		@click="onClick"
	>
		<v-icon :color="action.color || 'primary'" class="mr-1" small>
			{{ action.icon }}
		</v-icon>
		<span class="action-name">{{ t(action.name) }}</span>
	</div>
</template>

<script>
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import { SimpleAction } from '/@/components/Actions/SimpleAction'

export default {
	props: {
		action: SimpleAction,
	},
	mixins: [TranslationMixin],
	methods: {
		onClick() {
			this.$emit('click')
			this.action.trigger()
		},
	},
}
</script>

<style scoped>
.action {
	border-radius: 8px;
}

.action .action-name {
	opacity: 0.7;
	font-size: 14px;
}
</style>
