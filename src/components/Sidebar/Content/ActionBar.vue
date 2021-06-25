<template>
	<v-row cols="5" no-gutters>
		<v-col v-for="(action, i) in actions" :key="i">
			<Action
				:color="action.config.color"
				:icon="action.config.icon"
				:isSelected="action.isSelected"
				@click="onClick($event, action)"
			/>
		</v-col>
	</v-row>
</template>

<script>
import Action from './Action.vue'
import { SelectableSidebarAction } from './SelectableSidebarAction'

export default {
	props: {
		actions: Array,
	},
	components: {
		Action,
	},
	methods: {
		onClick(event, action) {
			if (action instanceof SelectableSidebarAction) action.select()
			else action.trigger(event)
		},
	},
}
</script>

<style></style>
