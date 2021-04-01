<template>
	<div class="d-flex mb-1">
		<Action v-for="action in actions" :key="action.id" :action="action" />
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
