<template>
	<div>
		<Draggable
			v-if="tabSystem.shouldRender"
			v-model="tabSystem.tabs"
			:group="{ name: 'tabSystemTabRow' }"
			@change="updateTab"
			@mousedown.native.self="tabSystem.setActive(true)"
			:style="`display: flex; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`"
		>
			<TabSystemTab
				v-for="tab in tabSystem.tabs"
				:key="tab.uuid"
				:tab="tab"
				:isActive="tabSystem.isActive"
			/>
		</Draggable>
		<TaskBar
			v-if="
				tabSystem.selectedTab && tabSystem.selectedTab.tasks.length > 0
			"
			:tasks="tabSystem.selectedTab.tasks"
		/>
	</div>
</template>

<script>
import TabSystemTab from './Tab.vue'
import TaskBar from './TabTasks/TaskBar.vue'
import Draggable from 'vuedraggable'

export default {
	components: {
		TabSystemTab,
		TaskBar,
		Draggable,
	},
	props: {
		tabSystem: Object,
	},
	methods: {
		updateTab({ added }) {
			if (!added) return
			added.element.toOtherTabSystem(false)
		},
	},
}
</script>

<style scoped>
*::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}
*::-webkit-scrollbar-track {
	border-radius: 0;
	background-color: var(--v-background-base);
}
*::-webkit-scrollbar-thumb {
	border-radius: 0;
	background-color: rgba(0, 0, 0, 0.4);
}
</style>
