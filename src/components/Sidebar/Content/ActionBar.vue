<template>
	<v-row class="action-bar pa-1" cols="5" no-gutters>
		<v-col v-for="(action, i) in actions" :key="i">
			<Action
				:color="action.config.color"
				:icon="action.config.icon"
				:name="action.config.name"
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

<style scoped>
.action-bar {
	position: sticky;
	top: 0;
	background: var(--v-expandedSidebar-base);
	z-index: 1;
}
</style>
