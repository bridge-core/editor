<template>
	<div class="pr-4 code-font" :style="`height: ${height}px; overflow: auto;`">
		<component
			:is="tab.treeEditor.tree.component"
			:tree="tab.treeEditor.tree"
			:treeEditor="tab.treeEditor"
		/>
	</div>
</template>

<script>
export default {
	name: 'TreeTab',
	props: {
		tab: Object,
		height: Number,
	},
}
</script>

<style>
.tree-editor-selection {
	outline: 1px solid white;
}
</style>
