<template>
	<div
		class="d-inline-flex mb-1"
		style="height: 21px; width: 100%; overflow-x: auto; overflow-y: hidden"
	>
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
