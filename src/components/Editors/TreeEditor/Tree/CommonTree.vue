<template>
	<details v-if="$slots.default" :style="tree.styles" :open="tree.isOpen">
		<summary
			:class="{ 'common-tree-key': true, open: tree.isOpen }"
			@click.stop.prevent="tree.isOpen = !tree.isOpen"
		>
			<v-icon class="mr-1" small> mdi-chevron-right </v-icon>
			<span v-if="tree.parent.type === 'object'"><slot />:</span>
			{{ openingBracket }}
		</summary>

		<TreeChildren v-if="tree.isOpen" :tree="tree" :height="height" />
		{{ closingBracket }}
	</details>
	<TreeChildren v-else :tree="tree" :height="height" />
</template>

<script>
import TreeChildren from './TreeChildren.vue'

const brackets = {
	array: '[]',
	object: '{}',
}

export default {
	name: 'ObjectTree',
	components: {
		TreeChildren,
	},
	props: {
		tree: Object,
		treeKey: String,
		height: Number,
	},
	computed: {
		openingBracket() {
			if (this.tree.isOpen) return brackets[this.tree.type][0]
			else if (Object.keys(this.tree.children).length > 0)
				return `${brackets[this.tree.type][0]}...${
					brackets[this.tree.type][1]
				}`
			return `${brackets[this.tree.type][0]}${
				brackets[this.tree.type][1]
			}`
		},
		closingBracket() {
			return this.tree.isOpen ? brackets[this.tree.type][1] : undefined
		},
	},
}
</script>

<style scoped>
.common-tree-key {
	list-style-type: none;
}
.common-tree-key .v-icon {
	position: relative;
	top: -2px;
	transition: transform 0.1s ease-in-out;
	transform: rotate(0deg);
}
.common-tree-key.open .v-icon {
	transform: rotate(90deg);
}
</style>
