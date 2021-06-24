<template>
	<v-row cols="5" no-gutters>
		<v-col v-for="(action, i) in actions" :key="i">
			<Action :color="action.config.color" :icon="action.config.icon" />
		</v-col>
	</v-row>
</template>

<script>
import Action from './Action.vue'

export default {
	props: {
		actions: Array,
	},
	components: {
		Action,
	},
}
</script>

<style></style>
