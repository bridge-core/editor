<template>
	<div
		class="d-flex px-1 mx-1 align-center action"
		v-ripple
		@click="action.trigger()"
	>
		<v-icon :color="action.color || 'primary'" class="mr-1" small>
			{{ action.icon }}
		</v-icon>
		<span class="action-name">{{ action.name }}</span>
	</div>
</template>

<script>
import { SimpleAction } from '/@/components/Actions/SimpleAction'

export default {
	props: {
		action: SimpleAction,
	},
}
</script>

<style scoped>
.action {
	cursor: pointer;
	border-radius: 8px;
}

.action .action-name {
	opacity: 0.7;
	font-size: 14px;
}
</style>
