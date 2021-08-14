<template>
	<div
		class="px-3 py-2"
		:class="{
			selected: tab.isSelected,
			'default-tab-style': true,
			'd-flex': true,
			'align-center': true,
			inactive: !isActive,
		}"
		ref="tabElement"
		@mousedown.left="hoveringBtn ? null : tab.select()"
		@mousedown.middle.prevent
		@click.middle="tab.close()"
		@click.right.prevent="tab.onContextMenu($event)"
	>
		<!-- Context menu button for touch -->
		<v-btn
			v-if="tab.isSelected && pointerDevice === 'touch'"
			text
			icon
			small
			@click="tab.onContextMenu($event)"
			@mouseenter="hoveringBtn = true"
			@mouseleave="hoveringBtn = false"
		>
			<v-icon>mdi-dots-vertical</v-icon>
		</v-btn>

		<v-badge
			:value="tab.isReadOnly || tab.isUnsaved"
			:class="{ 'mr-3': tab.isReadOnly }"
			:color="tab.iconColor"
			:icon="tab.isReadOnly ? 'mdi-lock-outline' : null"
			bordered
			overlap
			depressed
			:dot="tab.isUnsaved"
		>
			<v-icon class="mr-1" :color="tab.iconColor" small>
				{{ tab.icon }}
			</v-icon>
		</v-badge>

		<span :style="{ 'font-style': tab.isUnsaved ? 'italic' : null }">
			{{ tab.name }}
		</span>

		<v-btn
			@click.stop="tab.close()"
			text
			icon
			small
			@mouseenter="hoveringBtn = true"
			@mouseleave="hoveringBtn = false"
		>
			<v-icon small>mdi-close</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { Tab } from './CommonTab'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	name: 'TabSystemTab',
	props: {
		tab: Tab,
		isActive: Boolean,
	},
	data: () => ({
		hoveringBtn: false,
	}),
	setup() {
		return {
			pointerDevice,
		}
	},
	mounted() {
		if (this.isSelected) {
			this.$refs.tabElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			})
		}
	},
	computed: {
		isSelected() {
			return this.tab.isSelected
		},
	},
	watch: {
		isSelected() {
			if (this.isSelected)
				this.$refs.tabElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest',
				})
		},
	},
}
</script>

<style scoped>
.default-tab-style {
	background-color: var(--v-tabInactive-base);
	display: inline;
	width: fit-content;
}
.default-tab-style > * {
	opacity: 0.5;
}
.default-tab-style:hover > * {
	opacity: 0.9;
}
.selected > * {
	opacity: 0.9;
}
.selected {
	background-color: var(--v-tabActive-base);
}
.inactive {
	opacity: 0.3;
}
</style>
