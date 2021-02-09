<template>
	<div
		v-if="tabSystem && tabSystem.tabs.length > 0"
		:style="
			`display: flex; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`
		"
	>
		<TabSystemTab
			v-for="(tab, i) in tabSystem.tabs"
			:key="tab.uuid"
			:tab="tab"
			@click.native="tab.select()"
			@click.middle.native="tab.close()"
			@contextmenu.native="onContextMenu($event, i)"
		/>
	</div>
</template>

<script>
import { TabSystemMixin } from '../Mixins/TabSystem'
import TabSystemTab from './Tab.vue'

export default {
	mixins: [TabSystemMixin],
	components: {
		TabSystemTab,
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
