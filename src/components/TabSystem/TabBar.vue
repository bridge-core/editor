<template>
	<Draggable
		v-if="tabSystem && tabSystem.tabs.length > 0"
		v-model="tabSystem.tabs"
		:group="{ name: 'tabSystemTabRow' }"
		:style="
			`display: flex; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`
		"
	>
		<TabSystemTab
			v-for="tab in tabSystem.tabs"
			:key="tab.uuid"
			:tab="tab"
		/>
	</Draggable>
</template>

<script>
import { TabSystemMixin } from '../Mixins/TabSystem'
import TabSystemTab from './Tab.vue'
import Draggable from 'vuedraggable'

export default {
	mixins: [TabSystemMixin],
	components: {
		TabSystemTab,
		Draggable,
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
