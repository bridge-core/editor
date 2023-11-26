<template>
	<div class="d-inline-flex mb-1 tab-action-bar" style="">
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

<style scoped>
.tab-action-bar {
	height: 21px;
	width: 100%;
	overflow-x: auto;
	overflow-y: hidden;
}
</style>
