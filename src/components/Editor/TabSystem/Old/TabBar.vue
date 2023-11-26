<template>
	<div
		class="tab-bar"
		:class="{
			'mx-2': !isSidebarContentVisible,
			'ml-2': isSidebarContentVisible && isSidebarRight,
			'mr-2': isSidebarContentVisible && !isSidebarRight,
		}"
	>
		<Draggable
			v-if="tabSystem && tabSystem.shouldRender"
			v-model="tabSystem.tabs.value"
			:group="{
				name: 'tabSystemTabRow',
			}"
			:disabled="pointerDevice === 'touch'"
			@change="updateTab"
			@mousedown.native.self="tabSystem.setActive(true)"
			:style="`display: flex; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`"
		>
			<TabSystemTab
				v-for="(tab, i) in tabSystem.tabs.value"
				:key="tab.uuid"
				:tab="tab"
				:isActive="tabSystem.isActive.value"
				:isFirstTab="i === 0"
			/>
		</Draggable>
		<ActionBar
			v-if="
				tabSystem &&
				tabSystem.selectedTab &&
				tabSystem.selectedTab.actions.length > 0
			"
			:class="{ 'inactive-action-bar': !tabSystem.isActive.value }"
			:actions="tabSystem.selectedTab.actions"
			@click="tabSystem.setActive(true)"
		/>
	</div>
</template>

<script>
import TabSystemTab from './Tab.vue'
import ActionBar from './TabActions/ActionBar.vue'
import Draggable from 'vuedraggable'
import { pointerDevice } from '/@/libs/pointerDevice'
import { useTabSystem } from '../Composables/UseTabSystem'
import { toRefs } from 'vue'
import { useSidebarState } from '../Composables/Sidebar/useSidebarState'

export default {
	components: {
		TabSystemTab,
		ActionBar,
		Draggable,
	},
	props: {
		id: Number,
	},
	setup(props) {
		const { id } = toRefs(props)

		const { tabSystem } = useTabSystem(id)
		const {
			isContentVisible: isSidebarContentVisible,
			isAttachedRight: isSidebarRight,
		} = useSidebarState()

		return {
			tabSystem,
			pointerDevice,
			isSidebarContentVisible,
			isSidebarRight,
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
	border: none !important;
	background-color: var(--v-tabInactive-base);
}
.inactive-action-bar {
	opacity: 0.5;
}
.tab-bar {
	background: var(--v-background-base);
}
</style>
