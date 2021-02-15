<template>
	<div
		class="px-3 py-2"
		v-ripple="!tab.isSelected"
		:class="{
			selected: tab.isSelected,
			'default-tab-style': true,
			'd-flex': true,
			'align-center': true,
			inactive: !isActive,
		}"
		ref="tabElement"
		@mousedown="tab.select()"
		@click.middle="tab.close()"
		@click.right="tab.onContextMenu($event)"
	>
		<v-icon class="mr-1" :color="tab.iconColor" small>
			{{ tab.icon }}
		</v-icon>

		<span :style="{ 'font-style': tab.isUnsaved ? 'italic' : null }">
			{{ tab.name }}
		</span>

		<v-btn @click.stop="tab.close()" text icon small>
			<v-icon small>mdi-close</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { Tab } from './CommonTab'

export default {
	name: 'TabSystemTab',
	props: {
		tab: Tab,
		isActive: Boolean,
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
