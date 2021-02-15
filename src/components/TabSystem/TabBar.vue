<template>
	<Draggable
		v-if="tabSystem.shouldRender"
		v-model="tabSystem.tabs"
		:group="{ name: 'tabSystemTabRow' }"
		@change="updateTab"
		:style="
			`display: flex; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`
		"
	>
		<TabSystemTab
			v-for="tab in tabSystem.tabs"
			:key="tab.uuid"
			:tab="tab"
			:isActive="tabSystem.isActive"
		/>
	</Draggable>
</template>

<script>
import TabSystemTab from './Tab.vue'
import Draggable from 'vuedraggable'

export default {
	components: {
		TabSystemTab,
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
*::-webkit-scrollbar-track {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
*::-webkit-scrollbar-thumb {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
</style>
