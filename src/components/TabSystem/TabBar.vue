<template>
	<div
		v-if="mainTabSystem.tabs.length > 0"
		:style="
			`display: inline-block; overflow-x: scroll; white-space: nowrap; width: 100%; height: 48px;`
		"
	>
		<v-tab
			v-for="(tab, i) in mainTabSystem.tabs"
			:key="tab.uuid"
			:ripple="!tab.isSelected"
			:class="{
				tab: true,
				selected: tab.isSelected,
			}"
			@click.native="tab.select()"
			@click.middle.native="tab.close()"
			@contextmenu.native="onContextMenu($event, i)"
		>
			<span>
				{{ tab.name }}
			</span>

			<v-btn @click.stop="tab.close()" text icon small>
				<v-icon small>mdi-close</v-icon>
			</v-btn>
		</v-tab>
	</div>
</template>

<script>
import { mainTabSystem } from './Main'

export default {
	data: () => ({
		mainTabSystem,
	}),
}
</script>

<style scoped>
div.flex {
	padding-bottom: 0 !important;
}

.tab {
	padding: 8px 16px;
	text-transform: none;
	opacity: 0.5;
	display: inline-block;
	border-bottom: 2px solid var(--v-background-darken2);
	background: var(--v-background-darken1);
	max-width: unset;
	height: 100%;
}
.tab:hover {
	opacity: 1;
}
.tab.selected {
	opacity: 1;
	background: var(--v-background-darken1);
	border-bottom: 2px solid var(--v-primary-base);
	color: var(--v-primary-base);
}
*::-webkit-scrollbar-track {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
*::-webkit-scrollbar-thumb {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
</style>
