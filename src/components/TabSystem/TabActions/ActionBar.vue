<template>
	<div class="d-flex mb-1" style="height: 21px">
		<Action
			v-for="action in actions"
			:key="action.id"
			:action="action"
			@click="$emit('click')"
		/>
	</div>
</template>

<script>
import Action from './Action.vue'

export default {
	components: { Action },
	props: {
		actions: Array,
	},
}
</script>
