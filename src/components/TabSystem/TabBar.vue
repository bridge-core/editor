<template>
	<div>
		<Draggable
			v-if="tabSystem.shouldRender"
			v-model="tabSystem.tabs"
			:group="{
				name: 'tabSystemTabRow',
			}"
			:disabled="pointerDevice === 'touch'"
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
		<ActionBar
			v-if="
				tabSystem.selectedTab &&
				tabSystem.selectedTab.actions.length > 0
			"
			:class="{ 'inactive-action-bar': !tabSystem.isActive }"
			:actions="tabSystem.selectedTab.actions"
			@click="tabSystem.setActive(true)"
		/>
	</div>
</template>

<script>
import TabSystemTab from './Tab.vue'
import ActionBar from './TabActions/ActionBar.vue'
import Draggable from 'vuedraggable'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	components: {
		TabSystemTab,
		ActionBar,
		Draggable,
	},
	props: {
		tabSystem: Object,
	},
	setup() {
		return {
			pointerDevice,
		}
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

.inactive-action-bar {
	opacity: 0.5;
}
</style>
